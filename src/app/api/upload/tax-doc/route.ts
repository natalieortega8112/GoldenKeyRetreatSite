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
  const body = (await request.json()) as HandleUploadBody;
  console.log("[upload/tax-doc] incoming", { type: body?.type });

  if (body?.type === "blob.generate-client-token") {
    if (!(await isAdmin())) {
      console.warn("[upload/tax-doc] unauthorized token request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
      onUploadCompleted: async ({ blob }) => {
        console.log("[upload/tax-doc] completed", blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/tax-doc] handleUpload failed", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
