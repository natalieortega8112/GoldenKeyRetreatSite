import { Brush, Heart, ShieldCheck } from "lucide-react";

const standards = [
  {
    icon: Brush,
    title: "Clean Setup",
    body: "Thoroughly cleaned, inspected, and prepared between every guest.",
  },
  {
    icon: Heart,
    title: "Comfort-First Design",
    body: "Thoughtful interiors and quality touches that make each stay feel like home.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Hosting",
    body: "Clear communication, prompt responses, and consistent quality you can count on.",
  },
];

export function Standards() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-deep mb-3">
          Our Standards
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink">
          Built on a Foundation of Care
        </h2>
        <div className="mx-auto mt-5 w-24 divider-gold" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {standards.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl bg-white p-7 ring-1 ring-line text-center"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center mb-5">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">{title}</h3>
            <p className="text-sm text-charcoal/80 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
