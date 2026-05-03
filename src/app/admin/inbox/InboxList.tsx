"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Reply,
  Sparkles,
} from "lucide-react";
import type { InboxMessage, MessageStatus } from "@/lib/messages";
import { updateStatus } from "./_actions";

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

const STATUS_PILL: Record<MessageStatus, string> = {
  new: "bg-gold/20 text-gold-deep ring-gold/40",
  read: "bg-cream-soft text-charcoal ring-line",
  replied: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  archived: "bg-stone-100 text-stone-500 ring-stone-300",
};

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.round((now - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function InboxList({
  messages,
  showingArchived,
}: {
  messages: InboxMessage[];
  showingArchived: boolean;
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
        <Sparkles className="w-6 h-6 text-gold-deep mx-auto mb-3" />
        <p className="text-sm text-charcoal/75">
          {showingArchived
            ? "No archived messages."
            : "Inbox zero. New contact-form messages will appear here."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <Link
          href={showingArchived ? "/admin/inbox" : "/admin/inbox?archived=1"}
          className="text-xs text-charcoal/70 hover:text-gold-deep underline underline-offset-4"
        >
          {showingArchived ? "Hide archived" : "Show archived"}
        </Link>
      </div>
      <ul className="space-y-3">
        {messages.map((m) => (
          <MessageCard key={m.id} message={m} />
        ))}
      </ul>
    </>
  );
}

function MessageCard({ message }: { message: InboxMessage }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<MessageStatus>(message.status);

  function changeStatus(next: MessageStatus) {
    setStatus(next);
    startTransition(async () => {
      await updateStatus(message.id, next);
    });
  }

  function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && status === "new") changeStatus("read");
  }

  const subjectText =
    message.subject ?? `${message.body.slice(0, 60).trim()}${message.body.length > 60 ? "…" : ""}`;

  const mailtoHref = (() => {
    const subject = `Re: ${message.subject ?? "Your inquiry"}`;
    const quoted = message.body
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
    const body = `Hi ${message.name.split(" ")[0]},\n\n\n\n— Natalie\n\n${quoted}`;
    return `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <li className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-cream-soft/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${STATUS_PILL[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
            <span className="text-xs text-muted">{relTime(message.createdAt)}</span>
          </div>
          <div className="font-medium text-ink text-sm sm:text-[15px] truncate">
            {message.name}
          </div>
          <div className="text-sm text-charcoal/80 truncate">{subjectText}</div>
        </div>
        <div className="text-muted shrink-0 mt-0.5">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-line bg-cream-soft/30 space-y-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-charcoal/80">
            <a
              href={`mailto:${message.email}`}
              className="inline-flex items-center gap-1.5 hover:text-gold-deep"
            >
              <Mail className="w-3.5 h-3.5 text-gold-deep" />
              {message.email}
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone}`}
                className="inline-flex items-center gap-1.5 hover:text-gold-deep"
              >
                <Phone className="w-3.5 h-3.5 text-gold-deep" />
                {message.phone}
              </a>
            )}
          </div>

          <p className="text-sm text-ink/90 whitespace-pre-line leading-relaxed">
            {message.body}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={mailtoHref}
              className="btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply via Email
            </a>
            {status !== "replied" && (
              <button
                type="button"
                onClick={() => changeStatus("replied")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium ring-1 ring-line bg-white hover:ring-gold disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                Mark Replied
              </button>
            )}
            {status !== "archived" && (
              <button
                type="button"
                onClick={() => changeStatus("archived")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium ring-1 ring-line bg-white hover:ring-gold text-charcoal/80 disabled:opacity-60"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
