import Link from "next/link";
import { ReactNode } from "react";
import { isAdmin, clearAdminCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  await clearAdminCookie();
  redirect("/");
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await isAdmin();
  return (
    <div className="bg-cream min-h-full">
      {admin && (
        <div className="border-b border-line bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 h-12 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-deep">
                Admin
              </span>
              <Link
                href="/admin/units"
                className="text-charcoal hover:text-gold-deep"
              >
                Units
              </Link>
              <Link
                href="/admin/units/new"
                className="text-charcoal hover:text-gold-deep"
              >
                + New Unit
              </Link>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-muted hover:text-gold-deep"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
