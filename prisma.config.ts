import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  let url = process.env["DATABASE_URL"] ?? "";
  if (url.startsWith("postgres://")) {
    url = url.replace("postgres://", "postgresql://");
  }
  if (!url.startsWith("postgresql://")) {
    const match = url.match(/(postgresql?:\/\/.*)/);
    if (match) url = match[1];
  }
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
