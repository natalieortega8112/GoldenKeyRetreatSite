"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { updatePropertyItem, dollarsToCents } from "@/lib/operations";
import type { PropertyItemStatus } from "@/lib/operations";

function refresh() {
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/budget");
  revalidatePath("/admin/operations/inventory");
}

export async function updateBudgetField(
  id: string,
  patch: {
    budgetDollars?: string | null;
    priceDollars?: string | null;
    store?: string;
    status?: PropertyItemStatus;
    qty?: number;
    notes?: string;
  },
) {
  if (!(await isAdmin())) redirect("/admin/login");
  const update: Parameters<typeof updatePropertyItem>[1] = {};
  if (patch.budgetDollars !== undefined) {
    update.budgetCents = dollarsToCents(patch.budgetDollars);
  }
  if (patch.priceDollars !== undefined) {
    update.actualCostCents = dollarsToCents(patch.priceDollars);
  }
  if (patch.store !== undefined) update.store = patch.store;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.qty !== undefined) update.qty = Math.max(0, Math.trunc(patch.qty));
  if (patch.notes !== undefined) update.notes = patch.notes;
  await updatePropertyItem(id, update);
  refresh();
}
