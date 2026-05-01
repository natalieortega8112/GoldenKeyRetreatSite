import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  KeyRound,
  Home,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";

const TRUST_BADGES = [
  { icon: Home, label: "Family-Owned" },
  { icon: MapPin, label: "Locally Based" },
  { icon: KeyRound, label: "Self Check-In" },
  { icon: Clock, label: "Reply Under 1 Hr" },
  { icon: ShieldCheck, label: "Trusted Hosting" },
];

export function SiteFooter() {
  return (
    <footer
      id="site-footer"
      className="relative bg-cream text-ink overflow-hidden border-t border-line"
    >
      {/* Top gold accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-gold-soft via-gold to-gold-deep" />

      {/* Big logo watermark behind everything.
          Uses the light-bg logo variant so its baked-in cream background
          matches the cream-soft footer; mix-blend-multiply lets the
          gold strokes tint into the footer as a faint watermark with
          no visible rectangle. */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        aria-hidden
      >
        <Image
          src="/golden-key-retreats-logo.png"
          alt=""
          width={2166}
          height={726}
          sizes="100vw"
          className="w-[140%] sm:w-[110%] max-w-none opacity-20 sm:opacity-25 mix-blend-multiply select-none"
          priority={false}
        />
      </div>

      {/* Subtle palm-leaf atmosphere on top of watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        aria-hidden
      >
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1200 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#c9a24b">
            <path d="M -40 380 Q 60 280 130 180 Q 110 260 50 340 Z" />
            <path d="M 1240 380 Q 1140 280 1070 180 Q 1090 260 1150 340 Z" />
          </g>
        </svg>
      </div>

      {/* Trust signal bar */}
      <div className="relative border-b border-gold/25 bg-cream-soft/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4 flex flex-wrap justify-center sm:justify-between gap-x-6 gap-y-3 items-center">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-charcoal/85"
            >
              <Icon className="w-4 h-4 text-gold-deep shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Main footer — 2 columns, no corner logo */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-14 sm:py-16 grid gap-10 lg:gap-14 md:grid-cols-2 items-start">
        {/* Brand block */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-3">
            About Us
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-snug max-w-md">
            Boutique short-term stays in Miami &amp; Fort Lauderdale.
          </h3>
          <p className="mt-4 text-sm text-charcoal/75 max-w-md leading-relaxed">
            Handpicked, hand-prepared, and personally hosted by Natalie Ortega.
            Every detail tuned for comfort and trust.
          </p>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-charcoal/85 hover:text-gold-deep transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold-deep ring-1 ring-gold/40">
              <InstagramIcon />
            </span>
            Follow on Instagram
          </a>
        </div>

        {/* Host + contact block */}
        <div className="md:justify-self-end md:text-right max-w-md md:ml-auto">
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-2">
            Your Host
          </p>
          <p className="font-serif italic text-3xl sm:text-4xl text-gold-deep leading-none">
            Natalie Ortega
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-charcoal/65">
            Property Manager · Golden Key Retreats
          </p>

          <div className="mt-6 space-y-2.5 text-sm md:flex md:flex-col md:items-end">
            <a
              href="mailto:goldenkeyretreats@gmail.com"
              className="inline-flex items-center gap-2.5 text-charcoal hover:text-gold-deep transition-colors break-all"
            >
              <Mail className="w-4 h-4 text-gold-deep shrink-0" />
              goldenkeyretreats@gmail.com
            </a>
            <a
              href="tel:+13055109055"
              className="inline-flex items-center gap-2.5 text-charcoal hover:text-gold-deep transition-colors"
            >
              <Phone className="w-4 h-4 text-gold-deep shrink-0" />
              305-510-9055
            </a>
            <span className="inline-flex items-center gap-2.5 text-charcoal/75">
              <MapPin className="w-4 h-4 text-gold-deep shrink-0" />
              Miami, Florida
            </span>
          </div>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1.5 btn-gold px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Send a Message
          </Link>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="relative border-t border-gold/20 bg-cream-soft/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex flex-col sm:flex-row gap-2 justify-between items-center text-[11px] text-charcoal/65">
          <span>
            © {new Date().getFullYear()} Golden Key Retreats. All rights reserved.
          </span>
          <span className="italic text-charcoal/75">
            Boutique stays · Designed in Miami
          </span>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
