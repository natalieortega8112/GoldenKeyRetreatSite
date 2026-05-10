import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  buildOperationsWorkbook,
  uploadBackupSnapshot,
  pruneOldBackups,
} from "@/lib/backup";

const BACKUP_KEEP = 30;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Nightly auto-backup. Vercel Cron hits this with
 *   Authorization: Bearer ${CRON_SECRET}
 * if CRON_SECRET is set in env vars. Anything else gets 401.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "db_not_configured" },
      { status: 200 },
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, reason: "blob_not_configured" },
      { status: 200 },
    );
  }
  try {
    const buffer = await buildOperationsWorkbook();
    const blob = await uploadBackupSnapshot(buffer);
    // Best-effort prune. Failures here shouldn't fail the snapshot.
    let pruned = 0;
    try {
      pruned = await pruneOldBackups(BACKUP_KEEP);
    } catch {
      pruned = -1;
    }
    return NextResponse.json({
      ok: true,
      url: blob?.url ?? null,
      size: buffer.length,
      pruned,
      keep: BACKUP_KEEP,
      at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
