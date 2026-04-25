import { ScrollText } from "lucide-react";
import { HOUSE_RULES } from "@/lib/site-data";

export function Rules() {
  return (
    <section className="bg-cream-soft border-y border-line/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-gold/15 text-gold-deep flex items-center justify-center mb-4">
            <ScrollText className="w-5 h-5" />
          </div>
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-deep mb-3">
            House Standards
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink">
            Rules & Regulations
          </h2>
          <p className="mt-4 text-sm sm:text-base text-charcoal/75 max-w-2xl mx-auto">
            To keep every stay clean, comfortable, and respectful for all
            guests, we ask that you follow these guidelines during your stay.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {HOUSE_RULES.map(({ title, body }, idx) => (
            <div
              key={title}
              className="rounded-xl bg-white p-5 ring-1 ring-line flex gap-4"
            >
              <div className="font-serif text-xl sm:text-2xl text-gold-deep w-7 sm:w-8 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base sm:text-lg text-ink mb-1">
                  {title}
                </h3>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
