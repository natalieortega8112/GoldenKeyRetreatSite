import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Pencil,
  Trash2,
  ListChecks,
  Wallet,
  CalendarRange,
  ArrowLeft,
  Plus,
  ExternalLink,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  getProperty,
  listPropertyItems,
  listBookings,
  DEFAULT_CATEGORIES,
} from "@/lib/operations";
import type { PropertyItem } from "@/lib/operations";
import { deletePropertyAction } from "../actions";

export const revalidate = 0;
export const metadata = { title: "Property | Admin · Golden Key Retreats" };

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) redirect("/admin/operations/properties");
  const { id } = await params;

  const [property, items, bookings] = await Promise.all([
    getProperty(id).catch(() => null),
    listPropertyItems(id).catch(() => []),
    listBookings(id).catch(() => []),
  ]);
  if (!property) notFound();

  // Aggregate metrics
  const totalItems = items.length;
  const stocked = items.filter((i) => i.hasIt).length;
  const stockPct = totalItems > 0 ? Math.round((stocked / totalItems) * 100) : 0;

  const totalBudget = items.reduce((s, i) => s + (i.budgetCents ?? 0), 0);
  const totalSpent = items.reduce(
    (s, i) =>
      s + (i.actualCostCents != null ? i.actualCostCents * i.qty : 0),
    0,
  );
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const grossRevenue = bookings.reduce((s, b) => s + b.grossCents, 0);
  const netRevenue = bookings.reduce((s, b) => s + b.netCents, 0);
  const totalNights = bookings.reduce((s, b) => s + b.nights, 0);

  // Net position so far (revenue minus setup spend; rent left out — comment below)
  const netPosition = netRevenue - totalSpent;

  // Group items by category for compact view
  const byCat = new Map<string, PropertyItem[]>();
  for (const it of items) {
    const list = byCat.get(it.category) ?? [];
    list.push(it);
    byCat.set(it.category, list);
  }
  const orderedCats = [
    ...DEFAULT_CATEGORIES.filter((c) => byCat.has(c)),
    ...Array.from(byCat.keys()).filter((c) => !DEFAULT_CATEGORIES.includes(c)),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      {/* Top: back link + name + actions */}
      <Link
        href="/admin/operations"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted hover:text-gold-deep mb-3"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Operations
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            {property.beds ?? "—"} bd · {property.baths ?? "—"} ba
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink truncate">
            {property.name}
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            {property.address || "No address yet"}
          </p>
          {property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.amenities.map((a) => (
                <span
                  key={a}
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold-deep ring-1 ring-gold/30"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/operations/properties/${property.id}/edit`}
            className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <form
            action={async () => {
              "use server";
              await deletePropertyAction(property.id);
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-red-600 hover:bg-red-50 border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </form>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Stat
          label="Monthly Rent"
          value={fmt(property.monthlyRentCents ?? 0)}
          sub="all-in"
        />
        <Stat
          label="Stocked"
          value={`${stocked}/${totalItems}`}
          sub={`${stockPct}% complete`}
        />
        <Stat
          label="Total Spent"
          value={fmt(totalSpent)}
          sub={`of ${fmt(totalBudget)} budget`}
        />
        <Stat
          label="Net Revenue"
          value={fmt(netRevenue)}
          sub={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} · ${totalNights} nights`}
          accent
        />
      </div>

      {/* Net position banner */}
      <div
        className={`rounded-xl ring-1 px-5 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap ${
          netPosition >= 0
            ? "bg-emerald-50 ring-emerald-200"
            : "bg-amber-50 ring-amber-200"
        }`}
      >
        <div>
          <div
            className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${
              netPosition >= 0 ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            Net Position (revenue − setup spend)
          </div>
          <div
            className={`font-serif text-2xl sm:text-3xl mt-1 ${
              netPosition >= 0 ? "text-emerald-900" : "text-amber-900"
            }`}
          >
            {netPosition >= 0 ? "+" : "−"}
            {fmt(Math.abs(netPosition))}
          </div>
          <p className="text-[11px] text-charcoal/60 mt-1">
            Doesn&apos;t include accumulated rent payments. Subtract{" "}
            {fmt(property.monthlyRentCents ?? 0)} per month operated for the
            true P&amp;L picture.
          </p>
        </div>
        <div className="flex items-baseline gap-6 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Gross Revenue
            </div>
            <div className="font-serif text-lg text-ink">{fmt(grossRevenue)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Setup Spend
            </div>
            <div className="font-serif text-lg text-ink">{fmt(totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* Quick-link tab buttons */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <QuickLink
          href={`/admin/operations/inventory?property=${property.id}`}
          icon={<ListChecks className="w-4 h-4" />}
          title="Inventory"
          desc={`${stocked}/${totalItems} stocked`}
        />
        <QuickLink
          href={`/admin/operations/budget?property=${property.id}`}
          icon={<Wallet className="w-4 h-4" />}
          title="Budget"
          desc={`${budgetPct}% used`}
        />
        <QuickLink
          href="/admin/operations/income/new"
          icon={<CalendarRange className="w-4 h-4" />}
          title="Log Booking"
          desc={
            bookings.length > 0
              ? `${bookings.length} so far`
              : "First booking"
          }
        />
      </div>

      {/* Inventory snapshot by category */}
      <section className="bg-white rounded-xl ring-1 ring-line overflow-hidden mb-8">
        <header className="flex items-center justify-between px-5 py-3 bg-gold/5 border-b border-line">
          <h2 className="font-serif text-base text-ink">Inventory Snapshot</h2>
          <Link
            href={`/admin/operations/inventory?property=${property.id}`}
            className="text-xs text-gold-deep hover:text-ink inline-flex items-center gap-1"
          >
            Manage <ExternalLink className="w-3 h-3" />
          </Link>
        </header>
        {totalItems === 0 ? (
          <div className="p-6 text-sm text-charcoal/70">
            No items yet. Inventory should have seeded automatically when this
            property was created.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {orderedCats.map((cat) => {
              const list = byCat.get(cat) ?? [];
              const have = list.filter((i) => i.hasIt).length;
              const pct =
                list.length > 0 ? Math.round((have / list.length) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="px-5 py-3 flex items-center gap-4 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-ink font-medium">{cat}</div>
                    <div className="text-[11px] text-muted">
                      {have}/{list.length} stocked
                    </div>
                  </div>
                  <div className="w-32 sm:w-48">
                    <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-right text-[11px] text-muted tabular-nums">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent bookings */}
      <section className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 bg-gold/5 border-b border-line">
          <h2 className="font-serif text-base text-ink">Recent Bookings</h2>
          <Link
            href="/admin/operations/income/new"
            className="text-xs text-gold-deep hover:text-ink inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Log
          </Link>
        </header>
        {bookings.length === 0 ? (
          <div className="p-6 text-sm text-charcoal/70">
            No bookings logged yet.
            <Link
              href="/admin/operations/income/new"
              className="text-gold-deep hover:underline ml-1"
            >
              Log the first one →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                  <th className="px-3 py-2 font-normal text-left">Source</th>
                  <th className="px-3 py-2 font-normal text-left">Check-in</th>
                  <th className="px-3 py-2 font-normal text-left">Check-out</th>
                  <th className="px-3 py-2 font-normal text-center w-16">
                    Nights
                  </th>
                  <th className="px-3 py-2 font-normal text-right w-24">
                    Gross
                  </th>
                  <th className="px-3 py-2 font-normal text-right w-24">
                    Net
                  </th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-line/60 hover:bg-cream-soft/40"
                  >
                    <td className="px-3 py-2 text-charcoal/80">
                      {b.source || "—"}
                    </td>
                    <td className="px-3 py-2 text-charcoal/80 tabular-nums">
                      {b.checkIn}
                    </td>
                    <td className="px-3 py-2 text-charcoal/80 tabular-nums">
                      {b.checkOut}
                    </td>
                    <td className="px-3 py-2 text-center text-charcoal/80 tabular-nums">
                      {b.nights}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-charcoal/80">
                      {fmt(b.grossCents)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-gold-deep">
                      {fmt(b.netCents)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/operations/income/${b.id}/edit`}
                        className="btn-outline inline-flex items-center gap-1 px-2 py-1 rounded text-[10px]"
                      >
                        <Pencil className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 10 && (
              <div className="px-5 py-2 border-t border-line text-xs text-muted">
                Showing 10 of {bookings.length}.{" "}
                <Link
                  href="/admin/operations/income"
                  className="text-gold-deep hover:underline"
                >
                  View all →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 sm:p-5 ring-1 ring-line ${
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
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl ring-1 ring-line p-4 hover:ring-gold transition-all flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-serif text-sm text-ink">{title}</div>
        <div className="text-[11px] text-muted">{desc}</div>
      </div>
    </Link>
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
