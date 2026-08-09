"use client";

import Link from "next/link";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import type { Expense, Property } from "@/lib/operations";
import { EXPENSE_CATEGORIES } from "@/lib/operations-constants";
import { centsToDollars } from "@/lib/money";

type Props = {
  initial?: Expense;
  properties: Property[];
  defaultPropertyId?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function ExpenseForm({
  initial,
  properties,
  defaultPropertyId,
  action,
  submitLabel,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<string>("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const receipt = fd.get("receiptFile");
        if (receipt instanceof File && receipt.size > MAX_UPLOAD_BYTES) {
          setError(
            `Receipt is ${(receipt.size / 1024 / 1024).toFixed(1)} MB — the limit is 25 MB. Take a photo or use a smaller scan.`,
          );
          return;
        }
        setSubmitting(true);
        setError(null);
        setStatus("");
        try {
          if (receipt instanceof File && receipt.size > 0) {
            setStatus(`Uploading ${receipt.name} · 0%`);
            const controller = new AbortController();
            const timeout = setTimeout(() => {
              controller.abort();
            }, 90_000);
            let blob;
            try {
              blob = await upload(receipt.name, receipt, {
                access: "public",
                handleUploadUrl: "/api/upload/receipt",
                contentType: receipt.type || "application/octet-stream",
                abortSignal: controller.signal,
                onUploadProgress: ({ percentage }) => {
                  setStatus(
                    `Uploading ${receipt.name} · ${Math.round(percentage)}%`,
                  );
                },
              });
            } catch (err) {
              if (controller.signal.aborted) {
                throw new Error(
                  "Upload stalled after 90 s. This usually means an ad blocker, VPN, or corporate firewall is blocking blob.vercel-storage.com — try a different browser or turn off shields.",
                );
              }
              throw err;
            } finally {
              clearTimeout(timeout);
            }
            fd.set("receiptUrl", blob.url);
          }
          fd.delete("receiptFile");
          setStatus("Saving expense…");
          await action(fd);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[expense-form] submit failed", err);
          setError(msg);
          setStatus("");
          setSubmitting(false);
        }
      }}
      className="grid lg:grid-cols-3 gap-4 sm:gap-6"
    >
      <div className="lg:col-span-2 space-y-4 sm:space-y-5">
        <Card title="Expense">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Date *"
              name="spentOn"
              type="date"
              defaultValue={initial?.spentOn ?? todayIso()}
              required
            />
            <label className="block">
              <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
                Category *
              </span>
              <select
                name="category"
                required
                defaultValue={initial?.category ?? EXPENSE_CATEGORIES[0]}
                className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
              Property
            </span>
            <select
              name="propertyId"
              defaultValue={
                initial?.propertyId ?? defaultPropertyId ?? ""
              }
              className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            >
              <option value="">— LLC / Business-wide —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="block text-[11px] text-muted mt-1">
              Leave blank for LLC-level costs (e.g. business insurance, software).
            </span>
          </label>

          <Field
            label="Amount ($) *"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              initial?.amountCents != null
                ? centsToDollars(initial.amountCents)
                : ""
            }
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Vendor / Payee"
              name="vendor"
              placeholder="Home Depot, FPL, State Farm…"
              defaultValue={initial?.vendor}
            />
            <Field
              label="Description"
              name="description"
              placeholder="What was it for?"
              defaultValue={initial?.description}
            />
          </div>
        </Card>

        <Card title="Receipt & Notes">
          {initial?.receiptUrl && (
            <div className="rounded-md bg-gold/5 ring-1 ring-gold/20 px-3 py-2 text-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="uppercase tracking-wider text-[10px] text-gold-deep mb-0.5">
                  Current receipt
                </div>
                <a
                  href={initial.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:text-gold-deep inline-flex items-center gap-1 truncate"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{initial.receiptUrl}</span>
                </a>
              </div>
            </div>
          )}
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
              Upload a receipt
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="btn-outline inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose file
                <input
                  type="file"
                  name="receiptFile"
                  accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
                  className="hidden"
                  onChange={(e) =>
                    setPickedFile(e.target.files?.[0]?.name ?? "")
                  }
                />
              </label>
              {pickedFile && (
                <span className="text-xs text-charcoal/80 truncate max-w-[28ch]">
                  {pickedFile}
                </span>
              )}
            </div>
            <span className="block text-[11px] text-muted mt-1">
              PDF, PNG, or JPG · max 25 MB. Replaces the current receipt if one is attached.
            </span>
          </label>
          <Field
            label="…or paste a receipt URL"
            name="receiptUrl"
            type="url"
            placeholder="https://…"
            defaultValue={initial?.receiptUrl ?? ""}
          />
          <p className="text-[11px] text-muted -mt-1">
            Use this if the receipt lives in Drive, Dropbox, or the vendor&apos;s
            portal. Uploading a file above takes priority.
          </p>
          <FieldArea
            label="Notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes}
          />
        </Card>
      </div>

      <aside className="space-y-4">
        <Card title="Save">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-xs mb-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? status || "Saving…" : submitLabel}
          </button>
          <Link
            href="/admin/operations/expenses"
            className="block mt-2 text-center text-xs text-muted hover:text-gold-deep"
          >
            Cancel
          </Link>
        </Card>
      </aside>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 sm:p-6">
      <h3 className="font-serif text-lg text-ink mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
      />
    </label>
  );
}

function FieldArea({
  label,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
        {label}
      </span>
      <textarea
        {...rest}
        className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold resize-y"
      />
    </label>
  );
}
