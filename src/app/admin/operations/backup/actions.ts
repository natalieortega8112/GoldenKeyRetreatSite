"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { buildOperationsWorkbook, uploadBackupSnapshot } from "@/lib/backup";

/**
 * Generate a fresh .xlsx and upload it to Vercel Blob.
 * Returns the public URL of the new snapshot so the page can offer a download.
 */
export async function snapshotToBlob(): Promise<{ url: string | null; size: number }> {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) {
    throw new Error(
      "Database not configured. Add Postgres in Vercel and set POSTGRES_URL.",
    );
  }
  const buffer = await buildOperationsWorkbook();
  const blob = await uploadBackupSnapshot(buffer);
  revalidatePath("/admin/operations/backup");
  return { url: blob?.url ?? null, size: buffer.length };
}
