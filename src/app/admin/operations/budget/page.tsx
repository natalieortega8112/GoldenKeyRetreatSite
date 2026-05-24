import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  listProperties,
  listPropertyItems,
  listCategoriesForProperty,
} from "@/lib/operations";
import type { PropertyItem } from "@/lib/operations";
import { BudgetRow } from "./_components/BudgetRow";
import { AddBudgetItemRow } from "./_components/AddBudgetItemRow";
import { CategorySection } from "./_components/CategorySection";
import { QuickAddItem } from "./_components/QuickAddItem";
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

  const [items, categoryMeta] = selectedId
    ? await Promise.all([
        listPropertyItems(selectedId).catch(() => []),
        listCategoriesForProperty(selectedId).catch(() => []),
      ])
    : [[], []];

  // Group by category
  const byCat = new Map<string, PropertyItem[]>();
  for (const it of items) {
    const list = byCat.get(it.category) ?? [];
    list.push(it);
    byCat.set(it.category, list);
  }
  // Source of truth for order + budget = property_categories metadata.
  // Include any category that has items but somehow isn't in the meta yet
  // (defensive — listCategoriesForProperty back-fills, but stale state is possible).
  const metaNames = new Set(categoryMeta.map((c) => c.name));
  const extras = Array.from(byCat.keys()).filter((c) => !metaNames.has(c));
  const orderedCats = [
    ...categoryMeta.map((c) => c.name),
    ...extras,
  ];
  const budgetByCat = new Map(
    categoryMeta.map((c) => [c.name, c.budgetCents] as const),
  );

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
            price, store, or status inline. Total is qty × price/unit.{" "}
            <span className="text-charcoal/50">
              Drag the grip handle on any row to move it to another category.
            </span>
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

          {/* Quick Add — single row at the top, category dropdown picks
              which section the new row lands in. */}
          {selectedId && (
            <QuickAddItem
              propertyId={selectedId}
              categories={orderedCats}
              nextSortOrderByCategory={Object.fromEntries(
                orderedCats.map((c) => {
                  const list = byCat.get(c) ?? [];
                  const maxOrder = list.reduce(
                    (m, i) => Math.max(m, i.sortOrder),
                    0,
                  );
                  return [c, maxOrder + 1];
                }),
              )}
            />
          )}

          {/* Per-category roll-ups */}
          <div className="space-y-6">
            {orderedCats.map((cat, idx) => {
              const list = byCat.get(cat) ?? [];
              const catSpent = list.reduce(
                (s, i) =>
                  s +
                  (i.actualCostCents != null ? i.actualCostCents * i.qty : 0),
                0,
              );
              const catBought = list.filter((i) => i.status === "Bought").length;
              const maxOrder = list.reduce(
                (m, i) => Math.max(m, i.sortOrder),
                0,
              );
              return (
                <CategorySection
                  key={cat}
                  propertyId={selectedId!}
                  category={cat}
                  budgetCents={budgetByCat.get(cat) ?? null}
                  spentCents={catSpent}
                  bought={catBought}
                  total={list.length}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < orderedCats.length - 1}
                >
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
                </CategorySection>
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
