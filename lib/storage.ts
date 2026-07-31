import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid data URL");
  const [, mime, base64] = match;
  return { mime, buffer: Buffer.from(base64, "base64") };
}

/**
 * Decodes a base64 data URL and writes it to public/uploads/<userId>/<baseName>.<ext>,
 * returning the public path (e.g. "/uploads/<userId>/<baseName>.png").
 */
export async function saveDataUrlAsFile(
  dataUrl: string,
  userId: string,
  baseName: string
): Promise<string> {
  const { mime, buffer } = parseDataUrl(dataUrl);
  const ext = EXT_BY_MIME[mime] ?? "png";
  const dir = path.join(UPLOADS_ROOT, userId);
  await mkdir(dir, { recursive: true });
  const fileName = `${baseName}.${ext}`;
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${userId}/${fileName}`;
}

/** Deletes every file for a user's room (before/after, any extension) — best-effort. */
export async function deleteRoomFiles(userId: string, roomId: string) {
  const dir = path.join(UPLOADS_ROOT, userId);
  for (const suffix of ["before", "after"]) {
    for (const ext of Object.values(EXT_BY_MIME)) {
      try {
        await unlink(path.join(dir, `${roomId}-${suffix}.${ext}`));
      } catch {
        // file may not exist for this extension — ignore
      }
    }
  }
}

/** Deletes every uploaded/generated file for a user (their whole uploads directory) — best-effort. */
export async function deleteUserFiles(userId: string) {
  const dir = path.join(UPLOADS_ROOT, userId);
  await rm(dir, { recursive: true, force: true });
}
