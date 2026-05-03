"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  X,
} from "lucide-react";
import {
  headerLoginAction,
  headerLogoutAction,
} from "@/app/admin/_actions";

// Small key-icon button in the header.
//  - signed out: icon → dropdown with password field
//  - signed in:  icon → mini menu (Dashboard, Messages, Sign Out)
export function AdminLoginButton({
  isAdmin,
  unreadCount = 0,
}: {
  isAdmin: boolean;
  unreadCount?: number;
}) {
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup={isAdmin ? "menu" : "dialog"}
        aria-expanded={open}
        aria-label={isAdmin ? "Host menu" : "Host login"}
        className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-gold-deep hover:text-ink hover:bg-gold/10 transition-colors"
      >
        <KeyRound className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        {isAdmin && unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-gold text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-cream"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (isAdmin ? <AdminMenu unreadCount={unreadCount} onClose={() => setOpen(false)} /> : (
        <SignInPanel
          formAction={formAction}
          pending={pending}
          state={state}
          onClose={() => setOpen(false)}
        />
      ))}
    </div>
  );
}

function AdminMenu({
  unreadCount,
  onClose,
}: {
  unreadCount: number;
  onClose: () => void;
}) {
  return (
    <div
      role="menu"
      aria-label="Admin menu"
      className="absolute right-0 top-full mt-3 w-56 origin-top-right bg-white rounded-xl ring-1 ring-line shadow-xl shadow-gold/10 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-line bg-cream-soft">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">
          Signed In
        </p>
        <p className="text-xs text-charcoal/70 mt-0.5">Host workspace</p>
      </div>
      <ul className="py-1.5">
        <MenuLink
          href="/admin"
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          onClick={onClose}
        />
        <MenuLink
          href="/admin/inbox"
          icon={<Inbox className="w-4 h-4" />}
          label="Messages"
          badge={unreadCount > 0 ? String(unreadCount) : undefined}
          onClick={onClose}
        />
      </ul>
      <form action={headerLogoutAction} className="border-t border-line">
        <button
          type="submit"
          role="menuitem"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream-soft transition-colors"
        >
          <LogOut className="w-4 h-4 text-muted" />
          Sign Out
        </button>
      </form>
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onClick}
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-ink hover:bg-cream-soft transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-gold-deep">{icon}</span>
          {label}
        </span>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold-deep ring-1 ring-gold/40">
            {badge} new
          </span>
        )}
      </Link>
    </li>
  );
}

function SignInPanel({
  formAction,
  pending,
  state,
  onClose,
}: {
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: { error?: string } | null;
  onClose: () => void;
}) {
  return (
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
          onClick={onClose}
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

        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

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
  );
}
