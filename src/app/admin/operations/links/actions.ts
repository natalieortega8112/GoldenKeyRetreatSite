"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createCatalogEntry,
  updateCatalogEntry,
  deleteCatalogEntry,
  dollarsToCents,
} from "@/lib/operations";
import type { ProductCatalogInput } from "@/lib/operations";

function nullable(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function buildInput(formData: FormData): ProductCatalogInput {
  const item = nullable(formData.get("item"));
  const category = nullable(formData.get("category"));
  if (!item) throw new Error("Item name is required");
  if (!category) throw new Error("Category is required");
  const lastVerified = nullable(formData.get("lastVerifiedAt"));
  return {
    category,
    item,
    brand: nullable(formData.get("brand")),
    store: nullable(formData.get("store")),
    linkUrl: nullable(formData.get("linkUrl")),
    priceCents: dollarsToCents(formData.get("price") as string | null),
    notes: nullable(formData.get("notes")),
    lastVerifiedAt: lastVerified ? new Date(lastVerified).toISOString() : null,
  };
}

function refresh() {
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/links");
}

export async function createLinkAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await createCatalogEntry(buildInput(formData));
  refresh();
  redirect("/admin/operations/links");
}

export async function updateLinkAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  await updateCatalogEntry(id, buildInput(formData));
  refresh();
  redirect("/admin/operations/links");
}

export async function deleteLinkAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  await deleteCatalogEntry(id);
  refresh();
  redirect("/admin/operations/links");
}
