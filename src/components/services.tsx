import { HOMEPAGE_SERVICES } from "@/lib/site-data";

export function Services() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-12">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-deep mb-3">
          Included With Every Stay
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink">
          Services Provided
        </h2>
        <p className="mt-4 text-sm sm:text-base text-charcoal/75 max-w-2xl mx-auto">
          Every Golden Key Retreats stay comes with the essentials taken care of
          — so you can settle in and feel at home from minute one.
        </p>
        <div className="mx-auto mt-5 w-24 divider-gold" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {HOMEPAGE_SERVICES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl bg-white ring-1 ring-line p-5"
          >
            <div className="w-11 h-11 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-ink mb-1.5">{title}</h3>
            <p className="text-sm text-charcoal/75 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
