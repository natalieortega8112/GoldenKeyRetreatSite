import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-bg.jpg"
          alt="Sunlit Miami living room with skyline view"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Cream gradient overlay — strong on left for text legibility,
            fading right so the skyline view stays visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/30" />
        {/* Vertical fade so text is readable on every device */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-transparent to-cream/60" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-16 pb-10 sm:pb-14 lg:pb-20">
        <div className="max-w-2xl">
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
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-ink mb-5 sm:mb-6 drop-shadow-[0_1px_0_rgba(250,245,239,0.6)]">
            Clean, elevated stays
            <br className="hidden sm:block" />{" "}
            built for{" "}
            <span className="italic text-gold-deep">comfort, simplicity,</span>{" "}
            and trust.
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-charcoal/85 max-w-xl leading-relaxed mb-6 sm:mb-8">
            Golden Key Retreats is a modern stay brand in Miami focused on
            polished interiors, seamless experiences, and dependable hosting —
            so you can relax and enjoy your stay.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#featured-units"
              className="btn-gold inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-md text-sm font-medium tracking-wide shadow-lg shadow-gold/20"
            >
              View Featured Units
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
