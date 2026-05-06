import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const useSpaces = !!(
  process.env.DO_SPACES_KEY &&
  process.env.DO_SPACES_SECRET &&
  process.env.DO_SPACES_BUCKET
);

const spacesRegion = process.env.DO_SPACES_REGION || "fra1";

const s3 = useSpaces
  ? new S3Client({
      region: spacesRegion,
      endpoint: `https://${spacesRegion}.digitaloceanspaces.com`,
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
      forcePathStyle: false,
    })
  : null;

const cdnBase = process.env.DO_SPACES_CDN_URL
  ? process.env.DO_SPACES_CDN_URL.replace(/\/$/, "")
  : `https://${process.env.DO_SPACES_BUCKET}.${spacesRegion}.cdn.digitaloceanspaces.com`;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (s3) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_MAP[ext] ?? "application/octet-stream";

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET!,
        Key: `uploads/${filename}`,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      })
    );

    return `${cdnBase}/uploads/${filename}`;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (s3 && url.includes("digitaloceanspaces.com")) {
    const key = url.split(".com/").pop();
    if (key) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.DO_SPACES_BUCKET!,
          Key: key,
        })
      );
    }
  }
}

export { useSpaces };
