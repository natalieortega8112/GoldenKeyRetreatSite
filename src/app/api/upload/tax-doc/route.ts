import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_PREFIX = "tax-documents/";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/webp",
]);

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured on the server." },
      { status: 500 },
    );
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[upload/tax-doc] formData parse failed", err);
    return NextResponse.json(
      { error: "Could not read the uploaded file." },
      { status: 400 },
    );
  }
  const file = formData.get("file");
  const taxYear = String(formData.get("taxYear") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB (limit 25 MB).` },
      { status: 413 },
    );
  }
  const contentType = file.type || "application/octet-stream";
  if (contentType !== "application/octet-stream" && !ALLOWED.has(contentType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType}` },
      { status: 415 },
    );
  }
  const yearSegment = /^\d{4}$/.test(taxYear) ? `${taxYear}/` : "";
  const key = `${BLOB_PREFIX}${yearSegment}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName(file.name)}`;
  try {
    const blob = await put(key, file, {
      access: "private",
      addRandomSuffix: false,
      contentType,
    });
    console.log("[upload/tax-doc] stored", blob.url);
    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/tax-doc] put failed", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
