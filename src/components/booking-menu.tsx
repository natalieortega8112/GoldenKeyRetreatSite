"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { BOOKING_PLATFORMS } from "@/lib/site-data";

export function BookingMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn-gold inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
      >
        Book a Stay
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-64 origin-top-right bg-white rounded-xl ring-1 ring-line shadow-xl shadow-gold/10 overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-line bg-cream-soft">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">
              Book Through
            </p>
            <p className="text-sm text-charcoal mt-0.5">
              Choose your preferred platform
            </p>
          </div>
          <ul className="py-1.5">
            {BOOKING_PLATFORMS.map((p) => (
              <li key={p.name}>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-ink hover:bg-cream-soft transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      {p.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-gold-deep" />
                  </a>
                ) : (
                  <div
                    aria-disabled
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-muted cursor-not-allowed"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full opacity-40"
                        style={{ backgroundColor: p.accent }}
                      />
                      {p.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gold-deep/70">
                      Coming Soon
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
