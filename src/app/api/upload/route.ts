import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/server/db";
import { uploadFile } from "@/lib/storage";
import crypto from "crypto";

const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_DOC_SIZE = 20 * 1024 * 1024;

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

const EXT_FALLBACK: Record<string, string> = {
  jpg: "PHOTO",
  jpeg: "PHOTO",
  png: "PHOTO",
  webp: "PHOTO",
  mp4: "VIDEO",
  webm: "VIDEO",
  mov: "VIDEO",
  mp3: "AUDIO",
  pdf: "DOCUMENT",
  doc: "DOCUMENT",
  docx: "DOCUMENT",
  xls: "DOCUMENT",
  xlsx: "DOCUMENT",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const incidentId = formData.get("incidentId") as string | null;
  const contentOnly = formData.get("contentOnly") === "true";

  if (!file || !incidentId) {
    return NextResponse.json(
      { error: "Missing file or incidentId" },
      { status: 400 }
    );
  }

  const rawExt = (file.name.split(".").pop() || "").toLowerCase();
  const mediaType = ALLOWED_TYPES[file.type] || EXT_FALLBACK[rawExt];
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
  const isModerator = role === "MODERATOR" || role === "COORDINATOR";
  const isJournalist = role === "JOURNALIST" || role === "COORDINATOR";

  if (!isAuthor && !isModerator && !isJournalist) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(buffer, filename);

  if (mediaType === "DOCUMENT" || contentOnly) {
    return NextResponse.json({ url, type: mediaType, size: file.size });
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
