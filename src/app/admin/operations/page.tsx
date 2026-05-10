import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  ListChecks,
  Wallet,
  Link as LinkIcon,
  CalendarRange,
  Database,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { getPropertySummaries } from "@/lib/operations";
import { DEMO_SUMMARIES } from "./_demo";

export const metadata = {
  title: "Operations | Admin · Golden Key Retreats",
};

export const revalidate = 0;

export default async function OperationsHomePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const sp = await searchParams;
  const demo = sp.demo === "1";

  const dbReady = isDbConfigured();
  const summaries = demo
    ? DEMO_SUMMARIES
    : dbReady
      ? await getPropertySummaries().catch(() => [])
      : [];

  const totals = summaries.reduce(
    (acc, s) => ({
      properties: acc.properties + 1,
      rentCents:
        acc.rentCents + (s.property.monthlyRentCents ?? 0),
      itemCount: acc.itemCount + s.itemCount,
      itemsHave: acc.itemsHave + s.itemsHave,
      spentCents: acc.spentCents + s.totalSpentCents,
      budgetCents: acc.budgetCents + s.totalBudgetCents,
      grossRevenueCents: acc.grossRevenueCents + s.grossRevenueCents,
      netRevenueCents: acc.netRevenueCents + s.netRevenueCents,
    }),
    {
      properties: 0,
      rentCents: 0,
      itemCount: 0,
      itemsHave: 0,
      spentCents: 0,
      budgetCents: 0,
      grossRevenueCents: 0,
      netRevenueCents: 0,
    },
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-2">
          Operations
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink">
              Operations Sheet
            </h1>
            <p className="text-sm text-charcoal/70 mt-2">
              Inventory, expenses, and bookings across all your units.
            </p>
          </div>
          {!demo && (
            <Link
              href="/admin/operations?demo=1"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold/15 text-gold-deep ring-1 ring-gold/40 hover:bg-gold/25 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Demo
            </Link>
          )}
        </div>
      </header>

      {demo && (
        <div className="rounded-xl bg-gold/10 ring-1 ring-gold/40 px-4 py-3 mb-6 flex items-start gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-gold-deep mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <strong className="text-ink">Demo mode.</strong>
            <span className="text-charcoal/80">
              {" "}
              These are sample numbers — nothing here is connected to your real data.
              Use it to see how the dashboard looks once you start tracking properties.
            </span>
          </div>
          <Link
            href="/admin/operations"
            className="text-gold-deep hover:text-ink transition-colors shrink-0"
            aria-label="Exit demo"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!demo && !dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Add a Postgres database in
          your Vercel project (Storage → Postgres) and set <code>POSTGRES_URL</code>.
          Once connected, schemas auto-create on first request.
        </div>
      )}

      {/* Top stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <Stat
          label="Properties"
          value={totals.properties.toString()}
          sub={fmtMoney(totals.rentCents) + "/mo rent"}
        />
        <Stat
          label="Inventory Items"
          value={totals.itemCount.toString()}
          sub={`${totals.itemsHave} stocked`}
        />
        <Stat
          label="Total Spent"
          value={fmtMoney(totals.spentCents)}
          sub={`of ${fmtMoney(totals.budgetCents)} budgeted`}
          accent
        />
        <Stat
          label="Net Revenue"
          value={fmtMoney(totals.netRevenueCents)}
          sub={`${fmtMoney(totals.grossRevenueCents)} gross`}
        />
      </section>

      {/* Tab cards */}
      <h2 className="font-serif text-lg text-ink mb-3">Manage</h2>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
        <SectionCard
          href="/admin/operations/properties"
          icon={<Building2 className="w-5 h-5" />}
          title="Properties"
          desc="Add, edit, or remove rental units."
          badge={`${totals.properties}`}
          disabled={demo}
        />
        <SectionCard
          href="/admin/operations/inventory"
          icon={<ListChecks className="w-5 h-5" />}
          title="Inventory"
          desc="What's stocked at each unit."
          badge={`${totals.itemsHave}/${totals.itemCount}`}
          disabled={demo}
        />
        <SectionCard
          href="/admin/operations/budget"
          icon={<Wallet className="w-5 h-5" />}
          title="Budget"
          desc="Spend vs. plan, per category."
          badge={
            totals.budgetCents > 0
              ? Math.round((totals.spentCents / totals.budgetCents) * 100) + "%"
              : undefined
          }
          disabled={demo}
        />
        <SectionCard
          href="/admin/operations/links"
          icon={<LinkIcon className="w-5 h-5" />}
          title="Product Links"
          desc="Where to buy / re-buy each item."
          disabled={demo}
        />
        <SectionCard
          href="/admin/operations/income"
          icon={<CalendarRange className="w-5 h-5" />}
          title="Income / Bookings"
          desc="Revenue per property per booking."
          disabled={demo}
        />
        <SectionCard
          href="/admin/operations/backup"
          icon={<Database className="w-5 h-5" />}
          title="Backup"
          desc="Download a snapshot of all data."
          disabled={demo}
        />
      </div>

      {/* Per-property scoreboard */}
      {summaries.length > 0 && (
        <>
          <h2 className="font-serif text-lg text-ink mb-3">By Property</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((s) => (
              <PropertyCard
                key={s.property.id}
                summary={s}
                disabled={demo}
              />
            ))}
          </div>
        </>
      )}

      {summaries.length === 0 && dbReady && (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No properties yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            Add your first arbitrage unit to start tracking inventory and spend.
          </p>
          <Link
            href="/admin/operations/properties/new"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
          >
            Add First Property
          </Link>
        </div>
      )}
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
        className={`font-serif text-2xl sm:text-3xl ${
          accent ? "text-gold-deep" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

function SectionCard({
  href,
  icon,
  title,
  desc,
  badge,
  comingSoon,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  comingSoon?: boolean;
  disabled?: boolean;
}) {
  const inactive = comingSoon || disabled;
  const inner = (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 sm:p-6 hover:ring-gold transition-all flex items-start gap-4 group">
      <div className="w-11 h-11 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h2 className="font-serif text-lg text-ink">{title}</h2>
          {badge && !comingSoon && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold-deep ring-1 ring-gold/40">
              {badge}
            </span>
          )}
          {comingSoon && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 ring-1 ring-stone-300">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-charcoal/75">{desc}</p>
      </div>
      {!inactive && (
        <ArrowRight className="w-4 h-4 text-muted group-hover:text-gold-deep group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
      )}
    </div>
  );

  if (inactive) return <div className="opacity-60 cursor-not-allowed">{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}

function PropertyCard({
  summary,
  disabled,
}: {
  summary: Awaited<ReturnType<typeof getPropertySummaries>>[number];
  disabled?: boolean;
}) {
  const {
    property,
    itemCount,
    itemsHave,
    totalBudgetCents,
    totalSpentCents,
    bookingCount,
    netRevenueCents,
  } = summary;
  const stockPct = itemCount > 0 ? Math.round((itemsHave / itemCount) * 100) : 0;
  const budgetPct =
    totalBudgetCents > 0
      ? Math.round((totalSpentCents / totalBudgetCents) * 100)
      : 0;
  const netPosition = netRevenueCents - totalSpentCents;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
            {property.beds ?? "—"} bd · {property.baths ?? "—"} ba
          </div>
          <div className="font-serif text-lg text-ink truncate">
            {property.name}
          </div>
          <div className="text-xs text-muted truncate">{property.address}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted">rent</div>
          <div className="font-serif text-base text-gold-deep">
            {fmtMoney(property.monthlyRentCents ?? 0)}
          </div>
        </div>
      </div>

      <ProgressLine label="Stocked" pct={stockPct} caption={`${itemsHave}/${itemCount}`} />
      <ProgressLine
        label="Budget"
        pct={budgetPct}
        caption={`${fmtMoney(totalSpentCents)} / ${fmtMoney(totalBudgetCents)}`}
      />

      <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {bookingCount} {bookingCount === 1 ? "booking" : "bookings"} · net
          </div>
          <div className="font-serif text-base text-ink tabular-nums">
            {fmtMoney(netRevenueCents)}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${
              netPosition >= 0 ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            net position
          </div>
          <div
            className={`font-serif text-base tabular-nums ${
              netPosition >= 0 ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            {netPosition >= 0 ? "+" : "−"}
            {fmtMoney(Math.abs(netPosition))}
          </div>
        </div>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className="rounded-xl bg-white ring-1 ring-line p-5 cursor-default">
        {inner}
      </div>
    );
  }
  return (
    <Link
      href={`/admin/operations/properties/${property.id}`}
      className="rounded-xl bg-white ring-1 ring-line hover:ring-gold transition-all p-5 block"
    >
      {inner}
    </Link>
  );
}

function ProgressLine({
  label,
  pct,
  caption,
}: {
  label: string;
  pct: number;
  caption: string;
}) {
  return (
    <div className="mt-2.5">
      <div className="flex justify-between text-[11px] text-muted mb-1">
        <span>{label}</span>
        <span>{caption}</span>
      </div>
      <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full"
          style={{ width: Math.min(100, Math.max(0, pct)) + "%" }}
        />
      </div>
    </div>
  );
}

function fmtMoney(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString();
}
