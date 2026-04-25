"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  isDbConfigured,
} from "@/lib/db";
import type { UnitInput } from "@/lib/types";

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseInt(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function uploadPhotos(files: File[]): Promise<string[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Image upload is not configured. Set BLOB_READ_WRITE_TOKEN in your Vercel project (Storage → Blob).",
    );
  }
  const uploaded: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `units/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/octet-stream",
    });
    uploaded.push(blob.url);
  }
  return uploaded;
}

async function buildInputFromForm(formData: FormData): Promise<UnitInput> {
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim();
  if (!name) throw new Error("Unit name is required");
  if (!location) throw new Error("Location is required");

  const existingPhotos = formData
    .getAll("existingPhotos")
    .map((v) => String(v))
    .filter(Boolean);
  const newFiles = formData.getAll("newPhotos").filter(
    (v): v is File => v instanceof File && v.size > 0,
  );
  const newUrls = await uploadPhotos(newFiles);
  const photoUrls = [...existingPhotos, ...newUrls];

  const coverFromForm = String(formData.get("coverImageUrl") || "").trim();
  const coverImageUrl =
    coverFromForm && photoUrls.includes(coverFromForm)
      ? coverFromForm
      : photoUrls[0] || null;

  return {
    name,
    location,
    shortDescription: String(formData.get("shortDescription") || "").trim(),
    fullDescription: String(formData.get("fullDescription") || "").trim(),
    coverImageUrl,
    photoUrls,
    bedrooms: parseInt(formData.get("bedrooms")),
    bathrooms: parseInt(formData.get("bathrooms")),
    maxGuests: parseInt(formData.get("maxGuests")),
    pricePerNight: parseInt(formData.get("pricePerNight")),
    amenities: parseList(formData.get("amenities")),
    services: parseList(formData.get("services")),
    bookingUrl: (() => {
      const v = String(formData.get("bookingUrl") || "").trim();
      return v || null;
    })(),
  };
}

export async function createUnitAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) {
    throw new Error(
      "Database is not configured. Set POSTGRES_URL in your Vercel project (Storage → Postgres).",
    );
  }
  const input = await buildInputFromForm(formData);
  await createUnit(input);
  revalidatePath("/");
  revalidatePath("/units");
  redirect("/admin/units");
}

export async function updateUnitAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) {
    throw new Error("Database is not configured.");
  }
  const input = await buildInputFromForm(formData);
  await updateUnit(id, input);
  revalidatePath("/");
  revalidatePath("/units");
  revalidatePath(`/units/${id}`);
  redirect("/admin/units");
}

export async function deleteUnitAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  await deleteUnit(id);
  revalidatePath("/");
  revalidatePath("/units");
  redirect("/admin/units");
}
