import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listProperties } from "@/lib/operations";
import { deletePropertyAction } from "./actions";

export const revalidate = 0;
export const metadata = { title: "Properties | Admin · Golden Key Retreats" };

export default async function PropertiesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const properties = dbReady ? await listProperties().catch(() => []) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Properties
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Properties
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            One row per arbitrage unit. Adding a property auto-seeds its
            inventory checklist.
          </p>
        </div>
        <Link
          href="/admin/operations/properties/new"
          className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Property
        </Link>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Add a Postgres database in
          Vercel (Storage → Postgres) and set <code>POSTGRES_URL</code>.
        </div>
      )}

      {properties.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No properties yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            Add your first arbitrage unit to start tracking inventory and spend.
          </p>
          <Link
            href="/admin/operations/properties/new"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Create Your First Property
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden divide-y divide-line">
          {properties.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                  {p.beds ?? "—"} bd · {p.baths ?? "—"} ba
                </div>
                <div className="font-serif text-base sm:text-lg text-ink truncate">
                  {p.name}
                </div>
                <div className="text-xs text-muted truncate mt-0.5">
                  {p.address || "No address yet"}
                </div>
                {p.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.amenities.slice(0, 5).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold-deep ring-1 ring-gold/30"
                      >
                        {a}
                      </span>
                    ))}
                    {p.amenities.length > 5 && (
                      <span className="text-[10px] text-muted">
                        +{p.amenities.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right sm:mr-4 shrink-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  Rent
                </div>
                <div className="font-serif text-lg text-gold-deep">
                  {p.monthlyRentCents != null
                    ? "$" +
                      Math.round(p.monthlyRentCents / 100).toLocaleString() +
                      "/mo"
                    : "—"}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
                <Link
                  href={`/admin/operations/properties/${p.id}/edit`}
                  className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deletePropertyAction(p.id);
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
          ))}
        </div>
      )}
    </div>
  );
}
