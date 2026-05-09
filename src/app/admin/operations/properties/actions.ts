"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  dollarsToCents,
} from "@/lib/operations";
import type { PropertyInput } from "@/lib/operations";

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseInteger(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildInputFromForm(formData: FormData): PropertyInput {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Property name is required");

  return {
    name,
    address: String(formData.get("address") || "").trim(),
    monthlyRentCents: dollarsToCents(formData.get("monthlyRent") as string | null),
    beds: parseInteger(formData.get("beds")),
    baths: parseFloatOrNull(formData.get("baths")),
    amenities: parseList(formData.get("amenities")),
  };
}

export async function createPropertyAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) {
    throw new Error(
      "Database is not configured. Set POSTGRES_URL in your Vercel project (Storage → Postgres).",
    );
  }
  const input = buildInputFromForm(formData);
  await createProperty(input);
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/properties");
  redirect("/admin/operations/properties");
}

export async function updatePropertyAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  const input = buildInputFromForm(formData);
  await updateProperty(id, input);
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/properties");
  redirect("/admin/operations/properties");
}

export async function deletePropertyAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  await deleteProperty(id);
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/properties");
  redirect("/admin/operations/properties");
}
