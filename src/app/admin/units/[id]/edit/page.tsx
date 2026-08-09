import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Receipt } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getUnit } from "@/lib/db";
import {
  getProperty,
  listExpenses,
  listProperties,
} from "@/lib/operations";
import { UnitForm } from "../../_form/UnitForm";
import { updateUnitAction } from "../../actions";

export const metadata = {
  title: "Edit Unit | Golden Key Retreats",
};

function fmt(cents: number): string {
  return (
    "$" +
    Math.round(cents / 100).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  );
}

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const unit = await getUnit(id).catch(() => null);
  if (!unit) notFound();

  const properties = await listProperties().catch(() => []);
  const linkedProperty = unit.propertyId
    ? await getProperty(unit.propertyId).catch(() => null)
    : null;
  const expenses = linkedProperty
    ? await listExpenses(linkedProperty.id).catch(() => [])
    : [];
  const expenseTotal = expenses.reduce((acc, e) => acc + e.amountCents, 0);

  async function action(formData: FormData) {
    "use server";
    await updateUnitAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">Edit Unit</h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update details, manage photos, and save your changes.
      </p>
      <UnitForm
        initial={unit}
        properties={properties}
        action={action}
        submitLabel="Save Changes"
      />

      {linkedProperty && (
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
                Linked to · {linkedProperty.name}
              </p>
              <h2 className="font-serif text-xl sm:text-2xl text-ink">
                Expenses
              </h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Every expense tagged to <strong>{linkedProperty.name}</strong>{" "}
                in Operations. Total: <strong>{fmt(expenseTotal)}</strong>{" "}
                across <strong>{expenses.length}</strong>{" "}
                {expenses.length === 1 ? "entry" : "entries"}.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/operations/expenses/new?property=${linkedProperty.id}`}
                className="btn-gold inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs"
              >
                <Receipt className="w-3.5 h-3.5" /> Log Expense
              </Link>
              <Link
                href={`/admin/operations/properties/${linkedProperty.id}`}
                className="btn-outline inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs"
              >
                Open in Operations
              </Link>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="rounded-xl bg-white ring-1 ring-line p-8 text-center text-sm text-charcoal/70">
              No expenses logged for this property yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gold/5 border-b border-line">
                    <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                      <th className="px-3 py-3 font-normal text-left w-28">
                        Date
                      </th>
                      <th className="px-3 py-3 font-normal text-left">
                        Category
                      </th>
                      <th className="px-3 py-3 font-normal text-left">
                        Vendor / Description
                      </th>
                      <th className="px-3 py-3 font-normal text-right w-28">
                        Amount
                      </th>
                      <th className="px-3 py-3 font-normal text-center w-16">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr
                        key={e.id}
                        className="border-t border-line/60 hover:bg-cream-soft/40"
                      >
                        <td className="px-3 py-2.5 text-charcoal/80 tabular-nums">
                          {e.spentOn}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold-deep ring-1 ring-gold/30">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-ink">{e.vendor || "—"}</div>
                          {e.description && (
                            <div className="text-[11px] text-muted truncate max-w-[32ch]">
                              {e.description}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-ink">
                          {fmt(e.amountCents)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {e.receiptUrl ? (
                            <a
                              href={`/api/download/blob?url=${encodeURIComponent(e.receiptUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-gold-deep hover:text-ink"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
