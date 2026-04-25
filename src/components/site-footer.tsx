import { Logo } from "./logo";
import { Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-cream-soft border-t border-line/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 grid gap-8 md:grid-cols-3 items-center">
        <div className="flex md:justify-start justify-center">
          <Logo variant="footer" />
        </div>
        <div className="flex justify-center text-center">
          <span className="signature text-3xl sm:text-4xl text-gold-deep leading-none">
            Natalie Ortega
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1.5 text-sm text-charcoal">
          <a
            href="mailto:goldenkeyretreats@gmail.com"
            className="flex items-center gap-2 hover:text-gold-deep transition-colors break-all text-center md:text-right"
          >
            <Mail className="w-4 h-4 text-gold shrink-0" />
            goldenkeyretreats@gmail.com
          </a>
          <a
            href="tel:+13055109055"
            className="flex items-center gap-2 hover:text-gold-deep transition-colors"
          >
            <Phone className="w-4 h-4 text-gold shrink-0" />
            305-510-9055
          </a>
          <span className="flex items-center gap-2 text-muted">
            <MapPin className="w-4 h-4 text-gold shrink-0" />
            Miami, Florida
          </span>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 text-xs text-muted text-center">
          © {new Date().getFullYear()} Golden Key Retreats. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
