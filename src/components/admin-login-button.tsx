"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound, LayoutDashboard, Loader2, X } from "lucide-react";
import { headerLoginAction } from "@/app/admin/_actions";

// Small key-icon button in the header. Two modes:
//  - signed out: icon → dropdown with password field
//  - signed in:  icon morphs into a "Dashboard" link to /admin
export function AdminLoginButton({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(headerLoginAction, null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isAdmin) {
    return (
      <Link
        href="/admin"
        aria-label="Admin dashboard"
        className="inline-flex items-center gap-1.5 text-gold-deep hover:text-ink transition-colors text-[12px] sm:text-sm font-semibold"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Host login"
        className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-gold-deep hover:text-ink hover:bg-gold/10 transition-colors"
      >
        <KeyRound className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Host sign in"
          className="absolute right-0 top-full mt-3 w-72 origin-top-right bg-white rounded-xl ring-1 ring-line shadow-xl shadow-gold/10 overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-line bg-cream-soft flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">
                Host Sign In
              </p>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Manage units &amp; messages
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form action={formAction} className="p-4 space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-charcoal/80 mb-1.5 block">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="w-full rounded-md border border-line bg-cream-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </label>

            {state?.error && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {pending ? "Signing in…" : "Sign In"}
            </button>

            <p className="text-[10px] text-muted text-center">
              Private — for the host only.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
