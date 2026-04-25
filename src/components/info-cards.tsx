import { MapPin, Star } from "lucide-react";

export function InfoCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pb-12 sm:pb-16">
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <Card
          icon={<MapPin className="w-5 h-5" />}
          title="Miami-Based"
          body="Locally based, Lauderdale-focused, family-owned brand."
        />
        <Card
          icon={<Star className="w-5 h-5" />}
          title="Guest First"
          body="Every detail is made with the guest in mind."
        />
      </div>
    </section>
  );
}

function Card({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-white/60 ring-1 ring-line p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
        <p className="text-sm text-charcoal/80 mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
