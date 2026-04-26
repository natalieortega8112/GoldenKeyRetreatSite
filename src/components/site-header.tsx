import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="w-full sticky top-0 z-40">
      <div className="h-[3px] bg-gradient-to-r from-gold-soft via-gold to-gold-deep" />

      <div className="bg-cream/95 backdrop-blur border-b-2 border-gold/60 shadow-sm shadow-gold/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-24 sm:h-36 flex items-center justify-between gap-4">
          <Logo variant="header" />

          <nav className="flex items-center gap-3 sm:gap-8 text-sm sm:text-base font-bold tracking-wide">
            <NavLink href="/units">Featured Units</NavLink>
            <NavLink href="/contact">Contact</NavLink>

            <Link
              href="/units"
              className="btn-gold inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
            >
              Book a Stay
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative text-gold-deep hover:text-ink transition-colors whitespace-nowrap group"
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="absolute left-0 -bottom-1.5 h-[2px] w-0 bg-gold-deep transition-all duration-300 ease-out group-hover:w-full"
      />
    </Link>
  );
}
