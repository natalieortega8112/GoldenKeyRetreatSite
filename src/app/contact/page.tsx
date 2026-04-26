import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact | Golden Key Retreats",
  description: "Get in touch with Natalie Ortega at Golden Key Retreats.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-12">
        <p className="text-[10px] sm:text-xs tracking-[0.32em] uppercase text-gold-deep mb-3">
          Get In Touch
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink">Contact</h1>
        <div className="mx-auto mt-5 w-24 divider-gold" />
        <p className="mt-5 text-sm sm:text-base text-charcoal/75 max-w-xl mx-auto">
          Questions about a stay, a service, or one of our properties? Reach
          out — we&apos;ll get back to you quickly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
        <aside className="lg:col-span-2 space-y-4">
          <InfoBlock
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value="goldenkeyretreats@gmail.com"
            href="mailto:goldenkeyretreats@gmail.com"
          />
          <InfoBlock
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value="305-510-9055"
            href="tel:+13055109055"
          />
          <InfoBlock
            icon={<MapPin className="w-4 h-4" />}
            label="Based In"
            value="Miami, Florida"
          />
          <div className="rounded-xl bg-cream-soft ring-1 ring-line p-5">
            <p className="font-serif italic text-3xl text-gold-deep leading-none mb-2">
              Natalie Ortega
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/70">
              Property Manager · Golden Key Retreats
            </p>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted">
          {label}
        </div>
        <div className="text-sm text-ink mt-0.5 break-all">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      className="block bg-white rounded-xl ring-1 ring-line p-5 hover:ring-gold transition break-words"
    >
      {inner}
    </a>
  ) : (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 break-words">
      {inner}
    </div>
  );
}
