import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { getMusicFilePath } from "@/lib/playlists";

const MIME: Record<string, string> = {
  ".opus": "audio/opus",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".flac": "audio/flac",
  ".m4a": "audio/mp4",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playlist: string; file: string[] }> },
) {
  const { playlist, file } = await params;
  const fileName = file.map((part) => decodeURIComponent(part)).join("/");
  const filePath = getMusicFilePath(playlist, fileName);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const range = request.headers.get("range");

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (!match) {
      return new Response("Invalid range", { status: 416 });
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : stat.size - 1;

    if (start >= stat.size || end >= stat.size) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${stat.size}` },
      });
    }

    const stream = createReadStream(filePath, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
