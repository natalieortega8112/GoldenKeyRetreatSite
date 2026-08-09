"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { Property } from "@/lib/operations";
import { TAX_DOCUMENT_CATEGORIES } from "@/lib/operations-constants";

async function uploadTaxDoc(
  file: File,
  taxYear: number,
  onProgress: (pct: number) => void,
): Promise<{ url: string; name: string; size: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/tax-doc");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) resolve(data);
          else reject(new Error(data.error || "Upload succeeded but no URL returned."));
        } catch {
          reject(new Error("Server sent an invalid response."));
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.error) msg = data.error;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.timeout = 120_000;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("taxYear", String(taxYear));
    xhr.send(fd);
  });
}

type Props = {
  defaultYear: number;
  years: number[];
  properties: Property[];
  action: (formData: FormData) => Promise<void>;
};

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function UploadForm({ defaultYear, years, properties, action }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const yearOptions = Array.from(
    new Set([defaultYear, ...years, defaultYear - 1]),
  ).sort((a, b) => b - a);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const file = fd.get("file");
        const taxYear = Number(fd.get("taxYear"));
        if (!(file instanceof File) || file.size === 0) {
          setError("Choose a file to upload.");
          return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          setError(
            `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 25 MB. Split the PDF or use a smaller scan.`,
          );
          return;
        }
        setSubmitting(true);
        setError(null);
        setStatus(`Uploading ${file.name} · 0%`);
        try {
          const uploaded = await uploadTaxDoc(file, taxYear, (pct) => {
            setStatus(`Uploading ${file.name} · ${Math.round(pct)}%`);
          });
          fd.set("fileUrl", uploaded.url);
          fd.set("fileName", uploaded.name);
          fd.set("fileSize", String(uploaded.size));
          fd.delete("file");
          setStatus("Saving document…");
          await action(fd);
        } catch (err) {
          console.error("[tax-upload-form] submit failed", err);
          setError(err instanceof Error ? err.message : String(err));
          setStatus("");
          setSubmitting(false);
        }
      }}
      className="bg-white rounded-xl ring-1 ring-line p-5 sm:p-6 space-y-3"
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
            Tax Year *
          </span>
          <select
            name="taxYear"
            required
            defaultValue={defaultYear}
            className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
            Category *
          </span>
          <select
            name="category"
            required
            defaultValue={TAX_DOCUMENT_CATEGORIES[0]}
            className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          >
            {TAX_DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
            Document name
          </span>
          <input
            type="text"
            name="name"
            placeholder="e.g. Airbnb 1099-K"
            className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          />
          <span className="block text-[11px] text-muted mt-1">
            Leave blank to use the file name.
          </span>
        </label>

        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
            Property
          </span>
          <select
            name="propertyId"
            defaultValue=""
            className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          >
            <option value="">— LLC / Business-wide —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
          Notes
        </span>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold resize-y"
        />
      </label>

      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
          File *
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="btn-outline inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Choose file
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
          </label>
          {fileName && (
            <span className="text-xs text-charcoal/80 truncate max-w-[36ch]">
              {fileName}
            </span>
          )}
        </div>
        <span className="block text-[11px] text-muted mt-1">
          PDF, PNG, or JPG · max 25 MB. Uploads to encrypted Vercel Blob storage.
        </span>
      </label>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-xs">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> {status || "Uploading…"}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload Document
            </>
          )}
        </button>
      </div>
    </form>
  );
}
