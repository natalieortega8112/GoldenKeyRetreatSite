import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listBackupSnapshots } from "@/lib/backup";
import { BackupActions } from "./_components/BackupActions";

export const revalidate = 0;
export const metadata = { title: "Backup | Admin · Golden Key Retreats" };

export default async function BackupPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const snapshots = blobConfigured
    ? await listBackupSnapshots().catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
          Operations · Backup
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">
          Backup &amp; Snapshots
        </h1>
        <p className="text-sm text-charcoal/70 mt-1">
          The site is the source of truth. Backups are insurance — download or
          push to Blob anytime, and a nightly auto-snapshot runs in the
          background.
        </p>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      <BackupActions blobConfigured={blobConfigured} />

      {/* Snapshot history */}
      <h2 className="font-serif text-lg text-ink mb-3">Snapshot History</h2>
      {!blobConfigured ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-6 text-sm text-charcoal/70">
          <strong className="text-ink">Blob storage not connected.</strong>
          <br />
          To keep saved snapshots in the project (and enable nightly auto-backups),
          add <code>BLOB_READ_WRITE_TOKEN</code>: in Vercel → Storage → Blob →
          create store, attach to project. Manual <em>Download .xlsx</em> still
          works without it.
        </div>
      ) : snapshots.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-6 text-sm text-charcoal/70">
          No snapshots yet. Click <em>Save Snapshot to Blob</em> above to make
          one now, or wait for tonight&apos;s auto-backup.
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden divide-y divide-line">
          {snapshots.map((s) => (
            <div
              key={s.pathname}
              className="flex items-center gap-4 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-ink truncate">
                  {s.pathname.replace(/^operations-backups\//, "")}
                </div>
                <div className="text-[11px] text-muted">
                  {s.uploadedAt.toLocaleString()} · {(s.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-xs text-muted leading-relaxed">
        <strong className="text-charcoal">Auto-snapshot schedule:</strong>{" "}
        nightly at 03:15 America/New_York. Configure in <code>vercel.json</code>{" "}
        and the endpoint at <code>/api/cron/backup</code>.
      </div>
    </div>
  );
}
