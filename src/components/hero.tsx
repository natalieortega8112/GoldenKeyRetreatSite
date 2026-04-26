import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-20 pb-10 sm:pb-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <p className="hero-eyebrow flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 text-xs sm:text-base font-bold uppercase">
            <span
              aria-hidden
              className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-gold"
            />
            <span className="gold-gradient-text whitespace-nowrap">
              Welcome to Golden Key Retreats
            </span>
            <span
              aria-hidden
              className="h-px flex-1 sm:w-10 sm:flex-none bg-gradient-to-l from-transparent to-gold"
            />
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-ink mb-5 sm:mb-6">
            Clean, elevated stays
            <br className="hidden sm:block" />{" "}
            built for{" "}
            <span className="italic text-gold-deep">comfort, simplicity,</span>{" "}
            and trust.
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-charcoal/80 max-w-xl leading-relaxed mb-6 sm:mb-8">
            Golden Key Retreats is a modern stay brand in Miami focused on
            polished interiors, seamless experiences, and dependable hosting —
            so you can relax and enjoy your stay.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#featured-units"
              className="btn-gold inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-md text-sm font-medium tracking-wide"
            >
              View Featured Units
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-cream-soft to-gold-soft/40 ring-1 ring-line/80 shadow-xl shadow-gold/5">
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-8">
              <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-deep mb-2 sm:mb-3">
                Placeholder Preview
              </div>
              <div className="font-serif text-xl sm:text-2xl text-ink">
                Real unit photos coming soon
              </div>
              <div className="mt-5 sm:mt-6 h-px w-16 bg-gold/60" />
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted max-w-xs">
                Add your first unit from the admin panel to populate this space.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 hidden md:block w-32 h-32 rounded-full bg-gold/10 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
