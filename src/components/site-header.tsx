import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-line/70 bg-cream/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 sm:h-24 flex items-center justify-between gap-4">
        <Logo variant="header" />
        <nav className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm">
          <Link
            href="/units"
            className="text-charcoal hover:text-gold-deep transition-colors whitespace-nowrap"
          >
            Featured Units
          </Link>
          <Link
            href="/contact"
            className="text-charcoal hover:text-gold-deep transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
