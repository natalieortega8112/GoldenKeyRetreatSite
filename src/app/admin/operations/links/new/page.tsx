import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LinkForm } from "../_form/LinkForm";
import { createLinkAction } from "../actions";

export const metadata = { title: "New Product Link | Golden Key Retreats" };

export default async function NewLinkPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
        Operations · Product Links
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
        Add a Product Link
      </h1>
      <p className="text-sm text-charcoal/70 mb-6 sm:mb-8">
        Save the URL, store, and price for any item you want to re-buy easily.
      </p>
      <LinkForm action={createLinkAction} submitLabel="Save Link" />
    </div>
  );
}
