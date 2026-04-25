import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getUnit } from "@/lib/db";
import { UnitForm } from "../../_form/UnitForm";
import { updateUnitAction } from "../../actions";

export const metadata = {
  title: "Edit Unit | Golden Key Retreats",
};

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const unit = await getUnit(id).catch(() => null);
  if (!unit) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateUnitAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">Edit Unit</h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update details, manage photos, and save your changes.
      </p>
      <UnitForm
        initial={unit}
        action={action}
        submitLabel="Save Changes"
      />
    </div>
  );
}
