import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-line/70 bg-cream/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-20 sm:h-32 flex items-center justify-between gap-4">
        <Logo variant="header" />
        <nav className="flex items-center gap-5 sm:gap-10 text-sm sm:text-base">
          <Link
            href="/units"
            className="text-charcoal/90 hover:text-gold-deep transition-colors whitespace-nowrap"
          >
            Featured Units
          </Link>
          <Link
            href="/contact"
            className="text-charcoal/90 hover:text-gold-deep transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
