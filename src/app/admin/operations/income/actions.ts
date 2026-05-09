"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  createBooking,
  updateBooking,
  deleteBooking,
  dollarsToCents,
} from "@/lib/operations";
import type { BookingInput } from "@/lib/operations";

function nullable(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function parseIntOrZero(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function diffNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function buildInput(formData: FormData): BookingInput {
  const propertyId = nullable(formData.get("propertyId"));
  if (!propertyId) throw new Error("Property is required");
  const checkIn = nullable(formData.get("checkIn"));
  const checkOut = nullable(formData.get("checkOut"));
  if (!checkIn || !checkOut) throw new Error("Check-in and check-out dates are required");

  const explicitNights = parseIntOrZero(formData.get("nights"));
  const nights = explicitNights > 0 ? explicitNights : diffNights(checkIn, checkOut);

  const gross = dollarsToCents(formData.get("gross") as string | null) ?? 0;
  const cleaning = dollarsToCents(formData.get("cleaning") as string | null) ?? 0;
  const platformFee =
    dollarsToCents(formData.get("platformFee") as string | null) ?? 0;
  const explicitNet = dollarsToCents(formData.get("net") as string | null);
  const net = explicitNet ?? gross - cleaning - platformFee;

  return {
    propertyId,
    source: nullable(formData.get("source")),
    checkIn,
    checkOut,
    nights,
    grossCents: gross,
    cleaningCents: cleaning,
    platformFeeCents: platformFee,
    netCents: net,
    notes: nullable(formData.get("notes")),
  };
}

function refresh() {
  revalidatePath("/admin/operations");
  revalidatePath("/admin/operations/income");
}

export async function createBookingAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await createBooking(buildInput(formData));
  refresh();
  redirect("/admin/operations/income");
}

export async function updateBookingAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  await updateBooking(id, buildInput(formData));
  refresh();
  redirect("/admin/operations/income");
}

export async function deleteBookingAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  await deleteBooking(id);
  refresh();
  redirect("/admin/operations/income");
}
