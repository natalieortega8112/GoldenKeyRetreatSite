import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getExpense, listProperties } from "@/lib/operations";
import { ExpenseForm } from "../../_form/ExpenseForm";
import { updateExpenseAction } from "../../actions";

export const metadata = { title: "Edit Expense | Golden Key Retreats" };

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const [expense, properties] = await Promise.all([
    getExpense(id).catch(() => null),
    listProperties().catch(() => []),
  ]);
  if (!expense) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateExpenseAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Expenses
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Edit Expense
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update the amount, category, or attach a receipt link.
      </p>
      <ExpenseForm
        initial={expense}
        properties={properties}
        action={action}
        submitLabel="Save Changes"
      />
    </div>
  );
}
