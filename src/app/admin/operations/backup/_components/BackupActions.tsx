"use client";

import { useState, useTransition } from "react";
import { Download, CloudUpload, Loader2, Check } from "lucide-react";
import { snapshotToBlob } from "../actions";

export function BackupActions({ blobConfigured }: { blobConfigured: boolean }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSnapshot = () => {
    setStatus(null);
    setError(null);
    startTransition(async () => {
      try {
        const { url, size } = await snapshotToBlob();
        if (url) {
          setStatus(
            `Snapshot saved to Blob (${(size / 1024).toFixed(1)} KB)`,
          );
        } else {
          setError(
            "Generated, but BLOB_READ_WRITE_TOKEN is not set so it wasn't saved to Blob storage. Use Download instead.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 sm:p-6 mb-6">
      <h2 className="font-serif text-lg text-ink mb-1">Make a backup now</h2>
      <p className="text-sm text-charcoal/70 mb-4">
        Generate a fresh .xlsx with every property, inventory row, link, and
        booking — exactly what Nat sees on the site, frozen at this moment.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="/api/operations/backup/download"
          className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download .xlsx
        </a>
        <button
          type="button"
          onClick={onSnapshot}
          disabled={pending || !blobConfigured}
          className="btn-outline inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          title={
            blobConfigured
              ? "Save a snapshot to Vercel Blob (kept in the project)"
              : "Set BLOB_READ_WRITE_TOKEN in Vercel to enable"
          }
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
          Save Snapshot to Blob
        </button>
      </div>
      {status && (
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-700">
          <Check className="w-3.5 h-3.5" /> {status}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
