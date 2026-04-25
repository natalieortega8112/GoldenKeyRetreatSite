import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listUnits, isDbConfigured } from "@/lib/db";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteUnitAction } from "./actions";

export const revalidate = 0;

export const metadata = {
  title: "Manage Units | Golden Key Retreats",
};

export default async function AdminUnitsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const units = dbReady ? await listUnits().catch(() => []) : [];

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink">Manage Units</h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Add, edit, or remove the properties shown on your site.
          </p>
        </div>
        <Link
          href="/admin/units/new"
          className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Unit
        </Link>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Once you deploy to Vercel and
          add a Postgres database (Storage → Postgres), this page will list
          your units. Until then, adding units will fail.
        </div>
      )}

      {units.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No units yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            Click &quot;New Unit&quot; to create your first listing.
          </p>
          <Link
            href="/admin/units/new"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Create Your First Unit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden divide-y divide-line">
          {units.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-5 p-4"
            >
              <div className="w-20 h-20 rounded-md overflow-hidden bg-cream-soft relative shrink-0">
                {u.coverImageUrl ? (
                  <Image
                    src={u.coverImageUrl}
                    alt={u.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-muted">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-gold-deep">
                  {u.location}
                </div>
                <div className="font-serif text-lg text-ink truncate">
                  {u.name}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {u.bedrooms ?? "—"} bd · {u.bathrooms ?? "—"} ba · sleeps{" "}
                  {u.maxGuests ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/units/${u.id}/edit`}
                  className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteUnitAction(u.id);
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
