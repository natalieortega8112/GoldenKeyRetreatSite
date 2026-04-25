"use client";

import { useActionState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  if (state.status === "ok") {
    return (
      <div className="bg-white rounded-xl ring-1 ring-line p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl text-ink mb-2">
          Thank you — message sent.
        </h3>
        <p className="text-sm text-charcoal/75">
          Natalie will get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl ring-1 ring-line p-6 sm:p-8 space-y-4"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <Field label="Your Name *" name="name" required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email *" name="email" type="email" required />
        <Field label="Phone (optional)" name="phone" type="tel" />
      </div>
      <FieldArea
        label="Message *"
        name="message"
        rows={5}
        placeholder="Tell us a bit about your stay — dates, group size, anything you'd like to know."
        required
      />

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-medium disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-charcoal mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-md border border-line bg-cream-soft px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

function FieldArea({
  label,
  name,
  rows,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  rows: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-charcoal mb-1.5 block">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-line bg-cream-soft px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}
