import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-line/70 bg-cream/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-8 text-sm">
          <Link
            href="/units"
            className="text-charcoal hover:text-gold-deep transition-colors"
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
