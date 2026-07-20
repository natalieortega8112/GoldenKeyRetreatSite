import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listProperties } from "@/lib/operations";
import { ExpenseForm } from "../_form/ExpenseForm";
import { createExpenseAction } from "../actions";

export const metadata = { title: "Log Expense | Golden Key Retreats" };

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const properties = await listProperties().catch(() => []);
  const sp = await searchParams;
  const defaultPropertyId =
    sp.property && properties.some((p) => p.id === sp.property)
      ? sp.property
      : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Expenses
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Log an Expense
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Every operating cost. Tag it to a property so it hits that unit&apos;s
        P&amp;L, or leave the property blank for LLC-wide costs.
      </p>
      <ExpenseForm
        properties={properties}
        defaultPropertyId={defaultPropertyId}
        action={createExpenseAction}
        submitLabel="Save Expense"
      />
    </div>
  );
}
