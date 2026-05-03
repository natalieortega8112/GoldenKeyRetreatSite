"use server";

import { redirect } from "next/navigation";
import { checkPassword, clearAdminCookie, setAdminCookie } from "@/lib/auth";

// Used by the small login dropdown in the site header.
// Returns a string error or redirects on success.
export async function headerLoginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) {
    return { error: "Incorrect password." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function headerLogoutAction() {
  await clearAdminCookie();
  redirect("/");
}
