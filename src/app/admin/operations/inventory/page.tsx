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
import { InventoryRow } from "./_components/InventoryRow";
import { AddItemRow } from "./_components/AddItemRow";
import { PropertySelector } from "./_components/PropertySelector";
import { NewCategoryClient } from "./_components/NewCategoryClient";

export const revalidate = 0;
export const metadata = { title: "Inventory | Admin · Golden Key Retreats" };

export default async function InventoryPage({
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

  // Group by category, preserving DEFAULT_CATEGORIES order, then any extras.
  const byCat = new Map<string, PropertyItem[]>();
  for (const it of items) {
    const list = byCat.get(it.category) ?? [];
    list.push(it);
    byCat.set(it.category, list);
  }
  const orderedCats = [
    ...DEFAULT_CATEGORIES.filter((c) => byCat.has(c)),
    ...Array.from(byCat.keys()).filter(
      (c) => !DEFAULT_CATEGORIES.includes(c),
    ),
  ];

  const totalItems = items.length;
  const stocked = items.filter((i) => i.hasIt).length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Inventory
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Inventory Checklist
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            What&apos;s stocked at each unit. Tap a checkbox to mark stocked,
            edit qty / notes inline.
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Stat label="Items" value={totalItems.toString()} />
            <Stat label="Stocked" value={stocked.toString()} />
            <Stat
              label="% Stocked"
              value={
                totalItems > 0
                  ? Math.round((stocked / totalItems) * 100) + "%"
                  : "—"
              }
              accent
            />
          </div>

          {/* Tables grouped by category */}
          <div className="space-y-6">
            {orderedCats.map((cat) => {
              const list = byCat.get(cat) ?? [];
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
                    <h2 className="font-serif text-base text-ink">{cat}</h2>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                      {list.filter((i) => i.hasIt).length}/{list.length} stocked
                    </span>
                  </header>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                        <th className="px-2 py-2 w-10 font-normal text-center">
                          Have
                        </th>
                        <th className="px-2 py-2 font-normal text-left">
                          Item
                        </th>
                        <th className="px-2 py-2 font-normal text-center w-20">
                          Qty
                        </th>
                        <th className="px-2 py-2 font-normal text-left">
                          Notes
                        </th>
                        <th className="px-2 py-2 font-normal text-right w-16">
                          {""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((it) => (
                        <InventoryRow key={it.id} item={it} />
                      ))}
                      {selectedId && (
                        <AddItemRow
                          propertyId={selectedId}
                          category={cat}
                          nextSortOrder={maxOrder + 1}
                        />
                      )}
                    </tbody>
                  </table>
                </section>
              );
            })}
          </div>

          {/* Add a new category if needed */}
          {selectedId && (
            <details className="mt-6 bg-white/60 rounded-xl ring-1 ring-line/60 p-4">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-muted hover:text-gold-deep">
                Add a new category
              </summary>
              <NewCategoryClient
                propertyId={selectedId}
                startOrder={items.length + 1}
              />
            </details>
          )}
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

function EmptyProperties() {
  return (
    <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
      <h2 className="font-serif text-xl text-ink mb-2">No properties yet</h2>
      <p className="text-sm text-charcoal/70 mb-5">
        Add a property first — its inventory checklist will be seeded
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
