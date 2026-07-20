import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  listProperties,
  listTaxYears,
  getMonthlyPnl,
  getExpenseSummaryForYear,
  getExpenseSummaryForYearAndProperty,
} from "@/lib/operations";
import type { MonthlyPnlRow, Property } from "@/lib/operations";

export const revalidate = 0;
export const metadata = { title: "Reports | Admin · Golden Key Retreats" };

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; property?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();

  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const activeYear = Number(sp.year) || currentYear;
  const propertyFilter = sp.property && sp.property !== "all" ? sp.property : null;

  const [years, properties, monthly, categories] = dbReady
    ? await Promise.all([
        listTaxYears().catch(() => [currentYear]),
        listProperties().catch(() => []),
        getMonthlyPnl(activeYear, propertyFilter).catch(() => [] as MonthlyPnlRow[]),
        propertyFilter
          ? getExpenseSummaryForYearAndProperty(activeYear, propertyFilter).catch(() => [])
          : getExpenseSummaryForYear(activeYear).catch(() => []),
      ])
    : [[currentYear], [] as Property[], [] as MonthlyPnlRow[], []];

  const activeProperty = propertyFilter
    ? properties.find((p) => p.id === propertyFilter)
    : null;

  const totals = monthly.reduce(
    (acc, m) => ({
      gross: acc.gross + m.grossRevenueCents,
      net: acc.net + m.netRevenueCents,
      expenses: acc.expenses + m.expensesCents,
      profit: acc.profit + m.profitCents,
      bookings: acc.bookings + m.bookingCount,
    }),
    { gross: 0, net: 0, expenses: 0, profit: 0, bookings: 0 },
  );

  const margin =
    totals.net > 0
      ? Math.round(((totals.net - totals.expenses) / totals.net) * 100)
      : 0;

  const bestMonth = monthly.reduce<MonthlyPnlRow | null>(
    (best, m) => (m.profitCents > (best?.profitCents ?? -Infinity) ? m : best),
    null,
  );
  const worstMonth = monthly.reduce<MonthlyPnlRow | null>(
    (worst, m) =>
      m.profitCents < (worst?.profitCents ?? Infinity) ? m : worst,
    null,
  );

  const maxAbsProfit = Math.max(
    ...monthly.map((m) => Math.abs(m.profitCents)),
    1,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
          Operations · Reports
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">
          Monthly P&amp;L
        </h1>
        <p className="text-sm text-charcoal/70 mt-1">
          Revenue, expenses, and profit month-by-month.
          {propertyFilter
            ? " Filtered to a single property — LLC-wide costs excluded."
            : " All properties combined, including LLC-wide costs."}
        </p>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <FilterGroup label="Year">
          {years.map((y) => {
            const active = y === activeYear;
            const href = buildHref({ year: y, property: propertyFilter });
            return (
              <FilterPill key={y} href={href} active={active}>
                {y}
              </FilterPill>
            );
          })}
        </FilterGroup>

        <FilterGroup label="Property">
          <FilterPill
            href={buildHref({ year: activeYear, property: null })}
            active={!propertyFilter}
          >
            All
          </FilterPill>
          {properties.map((p) => (
            <FilterPill
              key={p.id}
              href={buildHref({ year: activeYear, property: p.id })}
              active={propertyFilter === p.id}
            >
              {p.name}
            </FilterPill>
          ))}
        </FilterGroup>
      </div>

      {activeProperty && (
        <div className="rounded-md bg-gold/5 ring-1 ring-gold/30 px-4 py-2.5 mb-6 text-sm text-charcoal/80">
          Showing:{" "}
          <strong className="text-ink">{activeProperty.name}</strong>
          {activeProperty.address && (
            <span className="text-muted"> · {activeProperty.address}</span>
          )}
        </div>
      )}

      {/* YTD summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Stat
          label={`${activeYear} Revenue (net)`}
          value={fmt(totals.net)}
          sub={`${fmt(totals.gross)} gross · ${totals.bookings} bookings`}
        />
        <Stat
          label={`${activeYear} Expenses`}
          value={fmt(totals.expenses)}
          sub={
            categories.length > 0
              ? `${categories.length} ${categories.length === 1 ? "category" : "categories"}`
              : "no expenses logged"
          }
        />
        <Stat
          label={`${activeYear} Profit`}
          value={fmt(totals.profit)}
          sub={`${margin}% margin`}
          accent
          negative={totals.profit < 0}
        />
        <Stat
          label="Best / Worst Month"
          value={
            bestMonth && worstMonth
              ? `${MONTH_LABELS[bestMonth.month - 1]} / ${MONTH_LABELS[worstMonth.month - 1]}`
              : "—"
          }
          sub={
            bestMonth && worstMonth
              ? `${fmt(bestMonth.profitCents)} / ${fmt(worstMonth.profitCents)}`
              : undefined
          }
        />
      </div>

      {/* Monthly table */}
      <section className="bg-white rounded-xl ring-1 ring-line overflow-hidden mb-8">
        <header className="flex items-center justify-between px-5 py-3 bg-gold/5 border-b border-line">
          <h2 className="font-serif text-base text-ink">
            {activeYear} Monthly Breakdown
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.15em] text-muted border-b border-line">
                <th className="px-3 py-2 font-normal text-left w-16">Month</th>
                <th className="px-3 py-2 font-normal text-center w-16">
                  Bookings
                </th>
                <th className="px-3 py-2 font-normal text-right">Gross</th>
                <th className="px-3 py-2 font-normal text-right">Net Revenue</th>
                <th className="px-3 py-2 font-normal text-right">Expenses</th>
                <th className="px-3 py-2 font-normal text-right">Profit</th>
                <th className="px-3 py-2 font-normal w-32 text-left">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const empty =
                  m.grossRevenueCents === 0 &&
                  m.expensesCents === 0 &&
                  m.bookingCount === 0;
                const barPct = Math.round(
                  (Math.abs(m.profitCents) / maxAbsProfit) * 100,
                );
                return (
                  <tr
                    key={m.month}
                    className={`border-t border-line/60 ${
                      empty ? "text-muted" : "text-charcoal/80"
                    } hover:bg-cream-soft/40`}
                  >
                    <td className="px-3 py-2.5 font-medium text-ink">
                      {MONTH_LABELS[m.month - 1]}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">
                      {m.bookingCount || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {m.grossRevenueCents > 0 ? fmt(m.grossRevenueCents) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {m.netRevenueCents > 0 ? fmt(m.netRevenueCents) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {m.expensesCents > 0 ? fmt(m.expensesCents) : "—"}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums font-medium ${
                        m.profitCents > 0
                          ? "text-emerald-700"
                          : m.profitCents < 0
                            ? "text-amber-700"
                            : ""
                      }`}
                    >
                      {empty ? "—" : fmt(m.profitCents)}
                    </td>
                    <td className="px-3 py-2.5">
                      {!empty && (
                        <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.profitCents >= 0
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: barPct + "%" }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-gold/5 text-ink font-medium">
                <td className="px-3 py-3">Total</td>
                <td className="px-3 py-3 text-center tabular-nums">
                  {totals.bookings}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {fmt(totals.gross)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {fmt(totals.net)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {fmt(totals.expenses)}
                </td>
                <td
                  className={`px-3 py-3 text-right tabular-nums font-serif text-base ${
                    totals.profit >= 0
                      ? "text-emerald-800"
                      : "text-amber-800"
                  }`}
                >
                  {fmt(totals.profit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Expense category breakdown */}
      <section className="bg-white rounded-xl ring-1 ring-line overflow-hidden mb-8">
        <header className="flex items-center justify-between px-5 py-3 bg-gold/5 border-b border-line">
          <h2 className="font-serif text-base text-ink">
            {activeYear} Expenses by Category
          </h2>
          <Link
            href="/admin/operations/expenses"
            className="text-xs text-gold-deep hover:text-ink inline-flex items-center gap-1"
          >
            Manage <ExternalLink className="w-3 h-3" />
          </Link>
        </header>
        {categories.length === 0 ? (
          <div className="p-6 text-sm text-charcoal/70">
            No expenses logged for {activeYear}
            {activeProperty ? ` at ${activeProperty.name}` : ""} yet.{" "}
            <Link
              href="/admin/operations/expenses/new"
              className="text-gold-deep hover:underline"
            >
              Log the first one →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {categories.map((row) => {
              const pct =
                totals.expenses > 0
                  ? Math.round((row.totalCents / totals.expenses) * 100)
                  : 0;
              return (
                <div
                  key={row.category}
                  className="px-5 py-3 flex items-center gap-4 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-ink font-medium">{row.category}</div>
                    <div className="text-[11px] text-muted">
                      {row.count} {row.count === 1 ? "expense" : "expenses"} ·{" "}
                      {pct}% of total
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
                  <div className="w-24 text-right tabular-nums font-medium text-ink">
                    {fmt(row.totalCents)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom callouts */}
      <div className="grid sm:grid-cols-2 gap-4">
        <CalloutCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Log every expense"
          body="Rent, utilities, cleaning, and repairs. If it's not in the tracker, the profit number lies."
          href="/admin/operations/expenses/new"
          hrefLabel="Log expense"
        />
        <CalloutCard
          icon={<TrendingDown className="w-4 h-4" />}
          title="Upload tax docs as they arrive"
          body="1099s, mortgage statements, insurance certs. Come tax time this becomes your CPA's dream folder."
          href="/admin/operations/taxes"
          hrefLabel="Open tax folder"
        />
      </div>
    </div>
  );
}

function buildHref({
  year,
  property,
}: {
  year: number;
  property: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("year", String(year));
  if (property) params.set("property", property);
  return `/admin/operations/reports?${params.toString()}`;
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted mr-1">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium ring-1 transition-colors ${
        active
          ? "bg-gold text-white ring-gold"
          : "bg-white text-charcoal ring-line hover:ring-gold/60"
      }`}
    >
      {children}
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-line ${
        accent ? (negative ? "bg-amber-50" : "bg-gold/5") : "bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep mb-1.5">
        {label}
      </div>
      <div
        className={`font-serif text-2xl ${
          accent
            ? negative
              ? "text-amber-900"
              : "text-gold-deep"
            : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

function CalloutCard({
  icon,
  title,
  body,
  href,
  hrefLabel,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-serif text-base text-ink">{title}</h3>
      </div>
      <p className="text-sm text-charcoal/70 mb-3">{body}</p>
      <Link
        href={href}
        className="text-xs text-gold-deep hover:text-ink inline-flex items-center gap-1 font-medium"
      >
        {hrefLabel} →
      </Link>
    </div>
  );
}

function fmt(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  return (
    sign +
    "$" +
    Math.round(Math.abs(cents) / 100).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  );
}
