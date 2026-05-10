"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ProductCatalogEntry } from "@/lib/operations";
import { centsToDollars } from "@/lib/money";

type Props = {
  initial?: ProductCatalogEntry;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function LinkForm({ initial, action, submitLabel }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          await action(new FormData(e.currentTarget));
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          setSubmitting(false);
        }
      }}
      className="grid lg:grid-cols-3 gap-4 sm:gap-6"
    >
      <div className="lg:col-span-2 space-y-4 sm:space-y-5">
        <Card title="Product">
          <Field
            label="Category *"
            name="category"
            placeholder="Kitchen, Bathroom, Living Room…"
            defaultValue={initial?.category}
            required
          />
          <Field
            label="Item *"
            name="item"
            placeholder="Plates set, Mattress, etc."
            defaultValue={initial?.item}
            required
          />
          <Field
            label="Brand / Model"
            name="brand"
            placeholder="Zinus 12&quot; / IKEA POKAL"
            defaultValue={initial?.brand}
          />
          <Field
            label="Store"
            name="store"
            placeholder="Amazon, Target, IKEA…"
            defaultValue={initial?.store}
          />
        </Card>

        <Card title="Link & Price">
          <Field
            label="Product URL"
            name="linkUrl"
            type="url"
            placeholder="https://…"
            defaultValue={initial?.linkUrl}
          />
          <Field
            label="Price (each, dollars)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="29.99"
            defaultValue={
              initial?.priceCents != null
                ? centsToDollars(initial.priceCents)
                : ""
            }
          />
          <Field
            label="Last Verified"
            name="lastVerifiedAt"
            type="date"
            defaultValue={
              initial?.lastVerifiedAt
                ? initial.lastVerifiedAt.slice(0, 10)
                : ""
            }
          />
        </Card>

        <Card title="Notes">
          <FieldArea
            label="Optional notes"
            name="notes"
            rows={3}
            placeholder="Color, size, alternative options…"
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
            {submitting ? "Saving…" : submitLabel}
          </button>
          <Link
            href="/admin/operations/links"
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
