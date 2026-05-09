"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Property } from "@/lib/operations";

type Props = {
  initial?: Property;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function PropertyForm({ initial, action, submitLabel }: Props) {
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
        <Card title="Basics">
          <Field
            label="Property Name *"
            name="name"
            placeholder="e.g. Cherry Tree, Bay Vista #1204"
            defaultValue={initial?.name}
            required
          />
          <Field
            label="Address"
            name="address"
            placeholder="123 Cherry Tree Ln, Miami, FL 33101"
            defaultValue={initial?.address ?? ""}
          />
        </Card>

        <Card title="The Money">
          <Field
            label="Monthly Rent (incl. utilities) — in dollars"
            name="monthlyRent"
            type="number"
            min="0"
            step="0.01"
            placeholder="2800.00"
            defaultValue={
              initial?.monthlyRentCents != null
                ? (initial.monthlyRentCents / 100).toFixed(2)
                : ""
            }
          />
          <p className="text-xs text-muted -mt-1">
            Used for the portfolio dashboard. Enter the all-in number you pay
            the landlord each month.
          </p>
        </Card>

        <Card title="The Layout">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Beds"
              name="beds"
              type="number"
              min="0"
              defaultValue={initial?.beds?.toString() ?? ""}
            />
            <Field
              label="Baths"
              name="baths"
              type="number"
              min="0"
              step="0.5"
              placeholder="1.5"
              defaultValue={initial?.baths?.toString() ?? ""}
            />
          </div>
        </Card>

        <Card title="Amenities">
          <FieldArea
            label="One per line"
            name="amenities"
            rows={6}
            placeholder={`Pool\nGym\nGarage parking\nIn-unit W/D`}
            defaultValue={(initial?.amenities ?? []).join("\n")}
          />
          <p className="text-xs text-muted -mt-1">
            Each line becomes its own pill on the dashboard.
          </p>
        </Card>
      </div>

      <aside className="space-y-4 sm:space-y-5">
        <Card title="Save">
          <p className="text-xs text-charcoal/70 mb-3">
            {initial
              ? "Saving updates this property's record."
              : "Creating this property will also seed it with the default inventory checklist (~76 items) so you can start tracking right away."}
          </p>
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
            href="/admin/operations/properties"
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
