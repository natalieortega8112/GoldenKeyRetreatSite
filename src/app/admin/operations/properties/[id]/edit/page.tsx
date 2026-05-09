import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getProperty } from "@/lib/operations";
import { PropertyForm } from "../../_form/PropertyForm";
import { updatePropertyAction } from "../../actions";

export const metadata = { title: "Edit Property | Golden Key Retreats" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const property = await getProperty(id).catch(() => null);
  if (!property) notFound();

  async function action(formData: FormData) {
    "use server";
    await updatePropertyAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Properties
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Edit Property
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update this unit&apos;s details. Inventory + booking history stay
        attached.
      </p>
      <PropertyForm
        initial={property}
        action={action}
        submitLabel="Save Changes"
      />
    </div>
  );
}
