import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listCatalog } from "@/lib/operations";
import { LinkForm } from "../../_form/LinkForm";
import { updateLinkAction } from "../../actions";

export const metadata = { title: "Edit Link | Golden Key Retreats" };

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const all = await listCatalog().catch(() => []);
  const entry = all.find((e) => e.id === id);
  if (!entry) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateLinkAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Product Links
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Edit Product Link
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Update brand, store, URL, or price.
      </p>
      <LinkForm initial={entry} action={action} submitLabel="Save Changes" />
    </div>
  );
}
