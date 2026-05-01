import Link from "next/link";
import { Logo } from "./logo";
import { BookingMenu } from "./booking-menu";

export function SiteHeader() {
  return (
    <header className="w-full sticky top-0 z-40">
      <div className="h-[3px] bg-gradient-to-r from-gold-soft via-gold to-gold-deep" />

      <div className="isolate bg-cream border-b-2 border-gold/60 shadow-sm shadow-gold/10">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-10 h-16 sm:h-36 flex items-center justify-between gap-2 sm:gap-4">
          <Logo variant="header" />

          <nav className="flex items-center gap-3 sm:gap-8 text-[13px] sm:text-base font-bold tracking-wide">
            <NavLink href="/units">
              <span className="sm:hidden">Units</span>
              <span className="hidden sm:inline">Featured Units</span>
            </NavLink>
            <NavLink href="/contact">Contact</NavLink>

            <div className="hidden sm:block">
              <BookingMenu />
            </div>
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
