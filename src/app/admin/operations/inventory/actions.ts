"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  createPropertyItem,
  deletePropertyItem,
  updatePropertyItem,
} from "@/lib/operations";
import type { PropertyItemStatus } from "@/lib/operations";

function requireAdmin() {
  return isAdmin().then((ok) => {
    if (!ok) redirect("/admin/login");
  });
}

function refresh() {
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/inventory");
  revalidatePath("/admin/operations/budget");
}

export async function toggleItemHas(id: string, has: boolean) {
  await requireAdmin();
  await updatePropertyItem(id, { hasIt: has });
  refresh();
}

export async function updateItemField(
  id: string,
  patch: {
    qty?: number;
    notes?: string;
    item?: string;
    category?: string;
    status?: PropertyItemStatus;
    store?: string;
    budgetCents?: number | null;
    actualCostCents?: number | null;
  },
) {
  await requireAdmin();
  await updatePropertyItem(id, patch);
  refresh();
}

export async function addItem(input: {
  propertyId: string;
  category: string;
  item: string;
  qty: number;
  notes: string;
  sortOrder: number;
}) {
  await requireAdmin();
  await createPropertyItem({
    ...input,
    budgetCents: null,
    actualCostCents: null,
    store: "",
    status: "Pending",
    hasIt: false,
  });
  refresh();
}

export async function removeItem(id: string) {
  await requireAdmin();
  await deletePropertyItem(id);
  refresh();
}
