import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { buildOperationsWorkbook } from "@/lib/backup";

export const dynamic = "force-dynamic";

// Streams a fresh .xlsx of the entire Operations Sheet to the user's browser
// for download. Auth: admin cookie required.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }
  const buffer = await buildOperationsWorkbook();
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const filename = `gkr-operations-${ts}.xlsx`;
  // Convert Buffer to Uint8Array for the Response constructor
  const body = new Uint8Array(buffer);
  return new Response(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
