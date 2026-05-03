import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Inbox,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { unreadCount } from "@/lib/messages";

export const metadata = {
  title: "Dashboard | Admin · Golden Key Retreats",
};

export const revalidate = 0;

export default async function AdminHomePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const unread = await unreadCount();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-2">
          Welcome Back
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">
          Host Dashboard
        </h1>
        <p className="text-sm text-charcoal/70 mt-2">
          Quick access to everything you manage on the site.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <Card
          href="/admin/inbox"
          icon={<Inbox className="w-5 h-5" />}
          title="Inbox"
          desc="Messages from the contact form."
          badge={unread > 0 ? `${unread} new` : undefined}
        />
        <Card
          href="/admin/units"
          icon={<Building2 className="w-5 h-5" />}
          title="Featured Units"
          desc="Add, edit, or remove rental listings."
        />
        <Card
          href="#"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          title="Operations Sheet"
          desc="Inventory · expenses · bookings."
          comingSoon
        />
        <Card
          href="/"
          icon={<Sparkles className="w-5 h-5" />}
          title="View Public Site"
          desc="See what guests see."
        />
      </div>
    </div>
  );
}

function Card({
  href,
  icon,
  title,
  desc,
  badge,
  comingSoon,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  comingSoon?: boolean;
}) {
  const inner = (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 sm:p-6 hover:ring-gold transition-all flex items-start gap-4 group">
      <div className="w-11 h-11 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h2 className="font-serif text-lg text-ink">{title}</h2>
          {badge && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold-deep ring-1 ring-gold/40">
              {badge}
            </span>
          )}
          {comingSoon && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 ring-1 ring-stone-300">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-charcoal/75">{desc}</p>
      </div>
      {!comingSoon && (
        <ArrowRight className="w-4 h-4 text-muted group-hover:text-gold-deep group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
      )}
    </div>
  );

  if (comingSoon) return <div className="opacity-70 cursor-not-allowed">{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
