import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listProperties } from "@/lib/operations";
import { BookingForm } from "../_form/BookingForm";
import { createBookingAction } from "../actions";

export const metadata = { title: "Log Booking | Golden Key Retreats" };

export default async function NewBookingPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const properties = await listProperties().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Income
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Log a Booking
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Each booking ties to a property and contributes to its profitability.
      </p>
      <BookingForm
        properties={properties}
        action={createBookingAction}
        submitLabel="Save Booking"
      />
    </div>
  );
}
