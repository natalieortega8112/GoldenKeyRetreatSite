import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listBookings, listProperties } from "@/lib/operations";
import { deleteBookingAction } from "./actions";

export const revalidate = 0;
export const metadata = { title: "Income | Admin · Golden Key Retreats" };

export default async function IncomePage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const [bookings, properties] = dbReady
    ? await Promise.all([
        listBookings().catch(() => []),
        listProperties().catch(() => []),
      ])
    : [[], []];

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const totals = bookings.reduce(
    (acc, b) => ({
      gross: acc.gross + b.grossCents,
      cleaning: acc.cleaning + b.cleaningCents,
      platform: acc.platform + b.platformFeeCents,
      net: acc.net + b.netCents,
      nights: acc.nights + b.nights,
    }),
    { gross: 0, cleaning: 0, platform: 0, net: 0, nights: 0 },
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Income
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Income & Bookings
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Log every booking. The dashboard shows which property is actually
            making money.
          </p>
        </div>
        <Link
          href="/admin/operations/income/new"
          className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Booking
        </Link>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Bookings" value={bookings.length.toString()} />
        <Stat label="Total Nights" value={totals.nights.toString()} />
        <Stat label="Gross Revenue" value={fmt(totals.gross)} />
        <Stat label="Net Revenue" value={fmt(totals.net)} accent />
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No bookings yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            {properties.length === 0
              ? "Add a property first, then log your first booking."
              : "Log your first booking to start tracking revenue per property."}
          </p>
          {properties.length === 0 ? (
            <Link
              href="/admin/operations/properties/new"
              className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
            >
              Add Property
            </Link>
          ) : (
            <Link
              href="/admin/operations/income/new"
              className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
            >
              <Plus className="w-4 h-4" /> Log First Booking
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gold/5 border-b border-line">
                <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                  <th className="px-3 py-3 font-normal text-left">Property</th>
                  <th className="px-3 py-3 font-normal text-left">Source</th>
                  <th className="px-3 py-3 font-normal text-left">Check-in</th>
                  <th className="px-3 py-3 font-normal text-left">Check-out</th>
                  <th className="px-3 py-3 font-normal text-center w-16">
                    Nights
                  </th>
                  <th className="px-3 py-3 font-normal text-right w-24">
                    Gross
                  </th>
                  <th className="px-3 py-3 font-normal text-right w-24">
                    Net
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const prop = propertyMap.get(b.propertyId);
                  return (
                    <tr
                      key={b.id}
                      className="border-t border-line/60 hover:bg-cream-soft/40"
                    >
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-ink">
                          {prop?.name ?? "Deleted property"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-charcoal/80">
                        {b.source || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-charcoal/80 tabular-nums">
                        {b.checkIn}
                      </td>
                      <td className="px-3 py-2.5 text-charcoal/80 tabular-nums">
                        {b.checkOut}
                      </td>
                      <td className="px-3 py-2.5 text-center text-charcoal/80 tabular-nums">
                        {b.nights}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-charcoal/80">
                        {fmt(b.grossCents)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-gold-deep">
                        {fmt(b.netCents)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/operations/income/${b.id}/edit`}
                            className="btn-outline inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px]"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Link>
                          <form
                            action={async () => {
                              "use server";
                              await deleteBookingAction(b.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] text-red-600 hover:bg-red-50 border border-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-line ${
        accent ? "bg-gold/5" : "bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep mb-1.5">
        {label}
      </div>
      <div
        className={`font-serif text-2xl ${
          accent ? "text-gold-deep" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function fmt(cents: number): string {
  return (
    "$" +
    Math.round(cents / 100).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  );
}
