import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listCatalog } from "@/lib/operations";
import { deleteLinkAction } from "./actions";

export const revalidate = 0;
export const metadata = { title: "Product Links | Admin · Golden Key Retreats" };

export default async function LinksPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const entries = dbReady ? await listCatalog().catch(() => []) : [];

  // Group by category
  const byCat = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byCat.get(e.category) ?? [];
    list.push(e);
    byCat.set(e.category, list);
  }

  const withLinks = entries.filter((e) => e.linkUrl).length;
  const total = entries.length;
  const pct = total > 0 ? Math.round((withLinks / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Product Links
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Product Links
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Master library — one row per product. Re-buy or set up a new unit
            with one click.
          </p>
        </div>
        <Link
          href="/admin/operations/links/new"
          className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Link
        </Link>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No links yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            Save your first product link so you can re-buy it instantly later.
          </p>
          <Link
            href="/admin/operations/links/new"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Add First Link
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Stat label="Total Products" value={total.toString()} />
            <Stat label="With Links" value={withLinks.toString()} />
            <Stat label="% Linked" value={pct + "%"} accent />
          </div>

          {/* Table grouped by category */}
          <div className="space-y-6">
            {[...byCat.entries()].map(([cat, list]) => (
              <section
                key={cat}
                className="bg-white rounded-xl ring-1 ring-line overflow-hidden"
              >
                <header className="flex items-center justify-between px-4 py-3 bg-gold/5 border-b border-line">
                  <h2 className="font-serif text-base text-ink">{cat}</h2>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                    {list.length} {list.length === 1 ? "product" : "products"}
                  </span>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                        <th className="px-3 py-2 font-normal text-left">
                          Item
                        </th>
                        <th className="px-3 py-2 font-normal text-left">
                          Brand / Model
                        </th>
                        <th className="px-3 py-2 font-normal text-left">
                          Store
                        </th>
                        <th className="px-3 py-2 font-normal text-left">
                          Link
                        </th>
                        <th className="px-3 py-2 font-normal text-right w-24">
                          Price
                        </th>
                        <th className="px-3 py-2 font-normal text-left w-28">
                          Verified
                        </th>
                        <th className="w-32"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((e) => (
                        <tr
                          key={e.id}
                          className="border-t border-line/60 hover:bg-cream-soft/40"
                        >
                          <td className="px-3 py-2.5 text-ink">{e.item}</td>
                          <td className="px-3 py-2.5 text-charcoal/80">
                            {e.brand || "—"}
                          </td>
                          <td className="px-3 py-2.5 text-charcoal/80">
                            {e.store || "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            {e.linkUrl ? (
                              <a
                                href={e.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-deep hover:underline inline-flex items-center gap-1"
                              >
                                Open
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-line italic">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-charcoal/80">
                            {e.priceCents != null
                              ? "$" + (e.priceCents / 100).toFixed(2)
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted">
                            {e.lastVerifiedAt
                              ? new Date(e.lastVerifiedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/operations/links/${e.id}/edit`}
                                className="btn-outline inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px]"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </Link>
                              <form
                                action={async () => {
                                  "use server";
                                  await deleteLinkAction(e.id);
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
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
