import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listExpenses, listProperties } from "@/lib/operations";
import { deleteExpenseAction } from "./actions";

export const revalidate = 0;
export const metadata = { title: "Expenses | Admin · Golden Key Retreats" };

export default async function ExpensesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();
  const [expenses, properties] = dbReady
    ? await Promise.all([
        listExpenses().catch(() => []),
        listProperties().catch(() => []),
      ])
    : [[], []];

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const totals = expenses.reduce(
    (acc, e) => {
      acc.total += e.amountCents;
      acc.byCategory.set(
        e.category,
        (acc.byCategory.get(e.category) ?? 0) + e.amountCents,
      );
      const key = e.spentOn.slice(0, 7); // YYYY-MM
      acc.byMonth.set(key, (acc.byMonth.get(key) ?? 0) + e.amountCents);
      return acc;
    },
    {
      total: 0,
      byCategory: new Map<string, number>(),
      byMonth: new Map<string, number>(),
    },
  );

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthTotal = totals.byMonth.get(thisMonthKey) ?? 0;

  const topCategory = [...totals.byCategory.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
            Operations · Expenses
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">
            Expenses
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Log every operating cost — rent, utilities, repairs, insurance.
            Feeds the monthly P&amp;L and year-end tax export.
          </p>
        </div>
        <Link
          href="/admin/operations/expenses/new"
          className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Expense
        </Link>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Expenses Logged" value={expenses.length.toString()} />
        <Stat label="This Month" value={fmt(thisMonthTotal)} />
        <Stat label="All-Time Total" value={fmt(totals.total)} accent />
        <Stat
          label="Top Category"
          value={topCategory ? topCategory[0] : "—"}
          sub={topCategory ? fmt(topCategory[1]) : undefined}
        />
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">No expenses yet</h2>
          <p className="text-sm text-charcoal/70 mb-5">
            Log your first expense — rent, utilities, a repair, anything.
          </p>
          <Link
            href="/admin/operations/expenses/new"
            className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Log First Expense
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gold/5 border-b border-line">
                <tr className="text-[9px] uppercase tracking-[0.15em] text-muted">
                  <th className="px-3 py-3 font-normal text-left w-28">Date</th>
                  <th className="px-3 py-3 font-normal text-left">Category</th>
                  <th className="px-3 py-3 font-normal text-left">Property</th>
                  <th className="px-3 py-3 font-normal text-left">
                    Vendor / Description
                  </th>
                  <th className="px-3 py-3 font-normal text-right w-28">
                    Amount
                  </th>
                  <th className="px-3 py-3 font-normal text-center w-16">
                    Receipt
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => {
                  const prop = e.propertyId
                    ? propertyMap.get(e.propertyId)
                    : null;
                  return (
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
                      <td className="px-3 py-2.5 text-charcoal/80">
                        {prop?.name ?? (
                          <span className="text-muted italic">LLC-wide</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-ink">{e.vendor || "—"}</div>
                        {e.description && (
                          <div className="text-[11px] text-muted truncate max-w-[26ch]">
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
                            href={e.receiptUrl}
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
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/operations/expenses/${e.id}/edit`}
                            className="btn-outline inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px]"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Link>
                          <form
                            action={async () => {
                              "use server";
                              await deleteExpenseAction(e.id);
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
                  );
                })}
              </tbody>
            </table>
          </div>
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
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
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
