"use server";

import { Resend } from "resend";
import { createMessage } from "@/lib/messages";

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const honeypot = String(formData.get("website") || "");

  if (honeypot) return { status: "ok" };

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in name, email, and message." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Persist to the inbox first so the message is captured even if email
  // delivery fails. Failures here don't block the email send.
  let persisted = false;
  try {
    await createMessage({
      name,
      email,
      phone: phone || null,
      subject: null,
      body: message,
    });
    persisted = true;
  } catch (err) {
    console.error("[contact] inbox persist failed", err);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL || "Golden Key Retreats <onboarding@resend.dev>";
  const toAddress = process.env.CONTACT_TO_EMAIL || "goldenkeyretreats@gmail.com";

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    if (persisted) return { status: "ok" };
    return {
      status: "error",
      message:
        "Email is not configured yet. Please email goldenkeyretreats@gmail.com directly for now.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: email,
      subject: `New inquiry from ${name} — Golden Key Retreats`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    return { status: "ok" };
  } catch (err) {
    console.error("[contact] resend error", err);
    if (persisted) return { status: "ok" };
    return {
      status: "error",
      message: "Sorry — your message couldn't be sent. Please try again or email directly.",
    };
  }
}
