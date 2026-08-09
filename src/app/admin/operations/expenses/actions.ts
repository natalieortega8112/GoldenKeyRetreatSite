"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  dollarsToCents,
} from "@/lib/operations";
import type { ExpenseInput } from "@/lib/operations";

const RECEIPT_PREFIX = "expense-receipts/";

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function orNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

async function buildInput(formData: FormData): Promise<ExpenseInput> {
  const spentOn = str(formData.get("spentOn"));
  if (!spentOn) throw new Error("Date is required");
  const category = str(formData.get("category"));
  if (!category) throw new Error("Category is required");
  const amount = dollarsToCents(formData.get("amount") as string | null) ?? 0;
  const receiptUrl = orNull(formData.get("receiptUrl"));
  return {
    propertyId: orNull(formData.get("propertyId")),
    spentOn,
    category,
    vendor: str(formData.get("vendor")),
    description: str(formData.get("description")),
    amountCents: amount,
    receiptUrl,
    notes: str(formData.get("notes")),
  };
}

function refresh() {
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/expenses");
  revalidatePath("/admin/operations/taxes");
}

export async function createExpenseAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await createExpense(await buildInput(formData));
  refresh();
  redirect("/admin/operations/expenses");
}

export async function updateExpenseAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prior = await getExpense(id);
  const next = await buildInput(formData);
  await updateExpense(id, next);
  // If the receipt was replaced with a new upload, clean up the old blob.
  if (
    prior?.receiptUrl &&
    prior.receiptUrl !== next.receiptUrl &&
    prior.receiptUrl.includes(RECEIPT_PREFIX) &&
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    try {
      await del(prior.receiptUrl);
    } catch {
      // Best-effort — the DB row is what matters.
    }
  }
  refresh();
  redirect("/admin/operations/expenses");
}

export async function deleteExpenseAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prior = await getExpense(id);
  await deleteExpense(id);
  if (
    prior?.receiptUrl &&
    prior.receiptUrl.includes(RECEIPT_PREFIX) &&
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    try {
      await del(prior.receiptUrl);
    } catch {
      // Best-effort cleanup.
    }
  }
  refresh();
  redirect("/admin/operations/expenses");
}
