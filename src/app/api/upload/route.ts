import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/server/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "PHOTO",
  "image/png": "PHOTO",
  "image/webp": "PHOTO",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "video/quicktime": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/webm": "AUDIO",
  "application/pdf": "DOCUMENT",
  "application/msword": "DOCUMENT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCUMENT",
  "application/vnd.ms-excel": "DOCUMENT",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "DOCUMENT",
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

  const mediaType = ALLOWED_TYPES[file.type];
  if (!mediaType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxSize =
    mediaType === "VIDEO" ? MAX_VIDEO_SIZE :
    mediaType === "DOCUMENT" ? MAX_DOC_SIZE :
    MAX_PHOTO_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large (max ${maxSize / 1024 / 1024}MB)` },
      { status: 400 }
    );
  }

  const incident = await db.incident.findUnique({
    where: { id: incidentId },
    select: { authorId: true },
  });

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  const role = session.user.role;
  const isAuthor = incident.authorId === session.user.id;
  const isJournalist = role === "JOURNALIST" || role === "COORDINATOR";

  if (!isAuthor && !isJournalist) {
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

  if (mediaType === "DOCUMENT") {
    return NextResponse.json({ url, type: "DOCUMENT", size: file.size });
  }

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
