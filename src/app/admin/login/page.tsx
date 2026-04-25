import { redirect } from "next/navigation";
import { checkPassword, isAdmin, setAdminCookie } from "@/lib/auth";
import { KeyRound } from "lucide-react";

export const metadata = {
  title: "Admin Login | Golden Key Retreats",
};

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin/units");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) {
    redirect("/admin/units");
  }
  const sp = await searchParams;
  const error = sp.error;

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="bg-white ring-1 ring-line rounded-xl p-8 shadow-sm">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
        <h1 className="font-serif text-2xl text-ink text-center">Admin Sign In</h1>
        <p className="text-sm text-charcoal/70 text-center mt-2 mb-6">
          Enter your password to manage Featured Units.
        </p>
        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-md border border-line bg-cream-soft px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {error && (
            <p className="text-sm text-red-600">
              Incorrect password. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="btn-gold w-full px-4 py-3 rounded-md text-sm font-medium"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
