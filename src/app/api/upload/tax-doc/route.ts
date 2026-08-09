import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "image/webp",
];

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        addRandomSuffix: true,
        maximumSizeInBytes: 25 * 1024 * 1024,
        tokenPayload: JSON.stringify({ kind: "tax-doc" }),
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/tax-doc] failed", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
