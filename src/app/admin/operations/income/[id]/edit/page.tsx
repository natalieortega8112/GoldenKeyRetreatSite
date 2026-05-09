import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listBookings, listProperties } from "@/lib/operations";
import { BookingForm } from "../../_form/BookingForm";
import { updateBookingAction } from "../../actions";

export const metadata = { title: "Edit Booking | Golden Key Retreats" };

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const [bookings, properties] = await Promise.all([
    listBookings().catch(() => []),
    listProperties().catch(() => []),
  ]);
  const booking = bookings.find((b) => b.id === id);
  if (!booking) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateBookingAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Income
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Edit Booking
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update dates, fees, or notes.
      </p>
      <BookingForm
        initial={booking}
        properties={properties}
        action={action}
        submitLabel="Save Changes"
      />
    </div>
  );
}
