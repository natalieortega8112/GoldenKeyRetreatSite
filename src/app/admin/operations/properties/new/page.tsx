import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { PropertyForm } from "../_form/PropertyForm";
import { createPropertyAction } from "../actions";

export const metadata = { title: "New Property | Golden Key Retreats" };

export default async function NewPropertyPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Properties
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Add a New Property
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Tell the sheet about a new arbitrage unit. We&apos;ll seed its
        inventory list automatically.
      </p>
      <PropertyForm action={createPropertyAction} submitLabel="Create Property" />
    </div>
  );
}
