import { Briefcase, Stethoscope, Plane, Building2 } from "lucide-react";

const types = [
  {
    icon: Briefcase,
    title: "Traveling Professionals",
    body: "Work-friendly spaces with fast Wi-Fi and a quiet workspace.",
  },
  {
    icon: Stethoscope,
    title: "Medical or Relocation Stays",
    body: "Comfortable, longer-term accommodations near hospitals and clinics.",
  },
  {
    icon: Plane,
    title: "Short-Trip Visits",
    body: "Quick getaways and weekend stays in walkable Miami neighborhoods.",
  },
  {
    icon: Building2,
    title: "Clean, Modern Miami Base",
    body: "A stylish home base for your time in South Florida.",
  },
];

export function StayTypes() {
  return (
    <section className="bg-cream-soft border-y border-line/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
          {types.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm sm:text-base text-ink leading-tight mb-2">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-charcoal/75 leading-relaxed max-w-[14rem]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
