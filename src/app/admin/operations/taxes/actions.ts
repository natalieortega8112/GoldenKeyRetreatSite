"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createTaxDocument,
  deleteTaxDocument,
  getTaxDocument,
} from "@/lib/operations";

const BLOB_PREFIX = "tax-documents/";

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function orNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadTaxDocumentAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "File upload is not configured. Set BLOB_READ_WRITE_TOKEN in your Vercel project (Storage → Blob).",
    );
  }

  const taxYear = Number(formData.get("taxYear"));
  if (!Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2100) {
    throw new Error("Tax year is required");
  }
  const category = str(formData.get("category"));
  if (!category) throw new Error("Category is required");
  const name = str(formData.get("name"));
  const notes = str(formData.get("notes"));
  const propertyId = orNull(formData.get("propertyId"));

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose a file to upload");
  }

  const key = `${BLOB_PREFIX}${taxYear}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName(file.name)}`;
  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || "application/octet-stream",
  });

  await createTaxDocument({
    taxYear,
    category,
    name: name || file.name,
    propertyId,
    fileUrl: blob.url,
    fileName: file.name,
    fileSize: file.size,
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
