import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { UnitForm } from "../_form/UnitForm";
import { createUnitAction } from "../actions";

export const metadata = {
  title: "New Unit | Golden Key Retreats",
};

export default async function NewUnitPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
      <h1 className="font-serif text-3xl text-ink mb-1">Add a New Unit</h1>
      <p className="text-sm text-charcoal/70 mb-8">
        Fill in the details and upload photos. The unit will appear on your
        homepage and Featured Units page once saved.
      </p>
      <UnitForm action={createUnitAction} submitLabel="Create Unit" />
    </div>
  );
}
