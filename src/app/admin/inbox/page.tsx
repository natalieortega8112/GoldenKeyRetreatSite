import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listMessages } from "@/lib/messages";
import { InboxList } from "./InboxList";
import { Inbox } from "lucide-react";

export const metadata = {
  title: "Inbox | Admin · Golden Key Retreats",
};

export const revalidate = 0;

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const sp = await searchParams;
  const showArchived = sp.archived === "1";
  const messages = await listMessages({ includeArchived: showArchived });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-2">
          Admin
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink flex items-center gap-3">
          <Inbox className="w-6 h-6 text-gold-deep" />
          Inbox
        </h1>
        <p className="text-sm text-charcoal/70 mt-2">
          Messages sent through the Contact form. Reply via email; mark as
          replied to keep this list tidy.
        </p>
      </header>

      <InboxList messages={messages} showingArchived={showArchived} />
    </div>
  );
}
