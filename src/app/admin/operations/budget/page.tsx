import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  listProperties,
  listPropertyItems,
  DEFAULT_CATEGORIES,
} from "@/lib/operations";
import type { PropertyItem } from "@/lib/operations";
import { BudgetRow } from "./_components/BudgetRow";
import { AddBudgetItemRow } from "./_components/AddBudgetItemRow";
import { PropertySelector } from "../inventory/_components/PropertySelector";

export const revalidate = 0;
export const metadata = { title: "Budget | Admin · Golden Key Retreats" };

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const properties = dbReady ? await listProperties().catch(() => []) : [];
  const params = await searchParams;
  const selectedId =
    params.property && properties.some((p) => p.id === params.property)
      ? params.property
      : properties[0]?.id;

  const items = selectedId
    ? await listPropertyItems(selectedId).catch(() => [])
    : [];

  // Group by category
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

  // Totals
  const totalSpent = items.reduce(
    (s, i) =>
      s + (i.actualCostCents != null ? i.actualCostCents * i.qty : 0),
    0,
  );
  const totalItems = items.length;
  const bought = items.filter((i) => i.status === "Bought").length;
  const pctBought = totalItems > 0 ? (bought / totalItems) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Budget
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Budget Tracker
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            What you actually paid for each item, per property. Edit qty,
            price, store, or status inline. Total is qty × price/unit.
          </p>
        </div>

        {properties.length > 0 && selectedId && (
          <PropertySelector
            properties={properties.map((p) => ({ id: p.id, name: p.name }))}
            selectedId={selectedId}
          />
        )}
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {properties.length === 0 ? (
        <EmptyProperties />
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Stat label="Total Spent" value={fmt(totalSpent)} accent />
            <Stat
              label="Items Bought"
              value={`${bought}/${totalItems}`}
            />
            <Stat label="% Bought" value={pctBought.toFixed(0) + "%"} />
          </div>

          {/* Per-category roll-ups */}
          <div className="space-y-6">
            {orderedCats.map((cat) => {
              const list = byCat.get(cat) ?? [];
              const catSpent = list.reduce(
                (s, i) =>
                  s +
                  (i.actualCostCents != null ? i.actualCostCents * i.qty : 0),
                0,
              );
              const catBought = list.filter((i) => i.status === "Bought").length;
              const catPct =
                list.length > 0 ? (catBought / list.length) * 100 : 0;
              const maxOrder = list.reduce(
                (m, i) => Math.max(m, i.sortOrder),
                0,
              );
              return (
                <section
                  key={cat}
                  className="bg-white rounded-xl ring-1 ring-line overflow-hidden"
                >
                  <header className="flex items-center justify-between px-4 py-3 bg-gold/5 border-b border-line">
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-serif text-base text-ink">{cat}</h2>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                        {fmt(catSpent)} spent · {catBought}/{list.length} bought
                      </span>
                    </div>
                    <div className="w-32 sm:w-48">
                      <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full"
                          style={{
                            width: Math.min(100, Math.max(0, catPct)) + "%",
                          }}
                        />
                      </div>
                    </div>
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                          <th className="px-2 py-2 font-normal text-left">
                            Item
                          </th>
                          <th className="px-2 py-2 font-normal text-center w-16">
                            Qty
                          </th>
                          <th className="px-2 py-2 font-normal text-right w-24">
                            Price/Unit
                          </th>
                          <th className="px-2 py-2 font-normal text-right w-24">
                            Total
                          </th>
                          <th className="px-2 py-2 font-normal text-left">
                            Store
                          </th>
                          <th className="px-2 py-2 font-normal text-center w-32">
                            Status
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((it) => (
                          <BudgetRow key={it.id} item={it} />
                        ))}
                        {selectedId && (
                          <AddBudgetItemRow
                            propertyId={selectedId}
                            category={cat}
                            nextSortOrder={maxOrder + 1}
                          />
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        </>
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
  const dollars = cents / 100;
  return (
    "$" +
    dollars.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function EmptyProperties() {
  return (
    <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
      <h2 className="font-serif text-xl text-ink mb-2">No properties yet</h2>
      <p className="text-sm text-charcoal/70 mb-5">
        Add a property first — its inventory + budget rows are seeded
        automatically.
      </p>
      <Link
        href="/admin/operations/properties/new"
        className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
      >
        Add Property
      </Link>
    </div>
  );
}
