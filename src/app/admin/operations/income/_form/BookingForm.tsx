"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Booking, Property } from "@/lib/operations";
import { centsToDollars } from "@/lib/operations";

type Props = {
  initial?: Booking;
  properties: Property[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

function diffNights(a: string, b: string): number {
  if (!a || !b) return 0;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2) || t2 <= t1) return 0;
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

export function BookingForm({ initial, properties, action, submitLabel }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? "");
  const [gross, setGross] = useState(centsToDollars(initial?.grossCents));
  const [cleaning, setCleaning] = useState(centsToDollars(initial?.cleaningCents));
  const [platformFee, setPlatformFee] = useState(
    centsToDollars(initial?.platformFeeCents),
  );

  const nights = useMemo(() => diffNights(checkIn, checkOut), [checkIn, checkOut]);

  const computedNet = useMemo(() => {
    const g = Number(gross) || 0;
    const c = Number(cleaning) || 0;
    const p = Number(platformFee) || 0;
    return Math.max(0, g - c - p);
  }, [gross, cleaning, platformFee]);

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
        <Card title="Booking">
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-muted mb-1.5">
              Property *
            </span>
            <select
              name="propertyId"
              required
              defaultValue={initial?.propertyId ?? properties[0]?.id ?? ""}
              className="w-full rounded-md border border-line bg-cream-soft/30 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            >
              {properties.length === 0 && (
                <option value="">Add a property first</option>
              )}
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Source"
            name="source"
            placeholder="Airbnb, VRBO, Direct…"
            defaultValue={initial?.source}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Check-in *"
              name="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) =>
                setCheckIn((e.target as HTMLInputElement).value)
              }
              required
            />
            <Field
              label="Check-out *"
              name="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) =>
                setCheckOut((e.target as HTMLInputElement).value)
              }
              required
            />
          </div>
          <Field
            label={`Nights (auto: ${nights})`}
            name="nights"
            type="number"
            min="0"
            placeholder={nights.toString()}
            defaultValue={initial?.nights?.toString() ?? ""}
          />
          <p className="text-xs text-muted -mt-1">
            Leave blank to auto-calculate from the dates above.
          </p>
        </Card>

        <Card title="The Money (in dollars)">
          <Field
            label="Gross Income"
            name="gross"
            type="number"
            min="0"
            step="0.01"
            value={gross}
            onChange={(e) => setGross((e.target as HTMLInputElement).value)}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Cleaning Fee"
              name="cleaning"
              type="number"
              min="0"
              step="0.01"
              value={cleaning}
              onChange={(e) =>
                setCleaning((e.target as HTMLInputElement).value)
              }
            />
            <Field
              label="Platform Fee"
              name="platformFee"
              type="number"
              min="0"
              step="0.01"
              value={platformFee}
              onChange={(e) =>
                setPlatformFee((e.target as HTMLInputElement).value)
              }
            />
          </div>
          <Field
            label={`Net (auto: $${computedNet.toFixed(2)})`}
            name="net"
            type="number"
            min="0"
            step="0.01"
            placeholder={computedNet.toFixed(2)}
            defaultValue={
              initial?.netCents != null
                ? centsToDollars(initial.netCents)
                : ""
            }
          />
          <p className="text-xs text-muted -mt-1">
            Leave blank to auto-calculate as Gross − Cleaning − Platform Fee.
          </p>
        </Card>

        <Card title="Notes">
          <FieldArea
            label="Optional"
            name="notes"
            rows={3}
            defaultValue={initial?.notes}
          />
        </Card>
      </div>

      <aside className="space-y-4">
        <Card title="Save">
          {properties.length === 0 && (
            <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 text-xs mb-3">
              You need at least one property before logging a booking.
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-xs mb-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || properties.length === 0}
            className="btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Saving…" : submitLabel}
          </button>
          <Link
            href="/admin/operations/income"
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
