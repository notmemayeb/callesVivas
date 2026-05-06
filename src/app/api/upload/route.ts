import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/server/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "PHOTO",
  "image/png": "PHOTO",
  "image/webp": "PHOTO",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/webm": "AUDIO",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const incidentId = formData.get("incidentId") as string | null;

  if (!file || !incidentId) {
    return NextResponse.json(
      { error: "Missing file or incidentId" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const mediaType = ALLOWED_TYPES[file.type];
  if (!mediaType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const incident = await db.incident.findUnique({
    where: { id: incidentId },
    select: { authorId: true },
  });

  if (!incident || incident.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const rawExt = file.name.split(".").pop() || "bin";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  const media = await db.media.create({
    data: {
      incidentId,
      type: mediaType as "PHOTO" | "VIDEO" | "AUDIO",
      url,
      size: file.size,
    },
  });

  return NextResponse.json({ media });
}
