import { Sofa, Wifi, KeyRound, Sparkles, MessageCircle } from "lucide-react";

const items = [
  {
    icon: Sofa,
    title: "Professionally Furnished",
    body: "Curated, comfortable interiors throughout every stay.",
  },
  {
    icon: Wifi,
    title: "Fast Wi-Fi",
    body: "Reliable, high-speed internet ready the moment you arrive.",
  },
  {
    icon: KeyRound,
    title: "Self Check-In",
    body: "Smart-key access for an easy, contactless arrival.",
  },
  {
    icon: Sparkles,
    title: "Spotless, Clean Interiors",
    body: "Detailed turnovers between every guest, no exceptions.",
  },
  {
    icon: MessageCircle,
    title: "Responsive Communication",
    body: "Messages answered quickly, day or night, by Natalie directly.",
  },
];

export function Expect() {
  return (
    <section className="bg-cream-soft border-y border-line/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-deep mb-3">
            Our Promise
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink">
            What You Can Expect
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white ring-1 ring-line flex items-center justify-center text-gold-deep mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base text-ink leading-tight mb-2">
                {title}
              </h3>
              <p className="text-xs text-charcoal/75 leading-relaxed max-w-[14rem]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
