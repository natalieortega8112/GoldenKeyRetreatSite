"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createTaxDocument,
  deleteTaxDocument,
  getTaxDocument,
} from "@/lib/operations";

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function orNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

export async function uploadTaxDocumentAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");

  const taxYear = Number(formData.get("taxYear"));
  if (!Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2100) {
    throw new Error("Tax year is required");
  }
  const category = str(formData.get("category"));
  if (!category) throw new Error("Category is required");
  const name = str(formData.get("name"));
  const notes = str(formData.get("notes"));
  const propertyId = orNull(formData.get("propertyId"));

  const fileUrl = str(formData.get("fileUrl"));
  const fileName = str(formData.get("fileName"));
  const fileSizeRaw = Number(formData.get("fileSize"));
  const fileSize = Number.isFinite(fileSizeRaw) ? fileSizeRaw : 0;
  if (!fileUrl) throw new Error("Upload didn't complete — try again.");

  await createTaxDocument({
    taxYear,
    category,
    name: name || fileName,
    propertyId,
    fileUrl,
    fileName,
    fileSize,
    notes,
  });

  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/taxes");
  redirect(`/admin/operations/taxes?year=${taxYear}`);
}

export async function deleteTaxDocumentAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  const doc = await getTaxDocument(id);
  await deleteTaxDocument(id);
  if (doc?.fileUrl && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(doc.fileUrl);
    } catch {
      // Blob may already be gone — the DB row is what matters.
    }
  }
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/taxes");
}
