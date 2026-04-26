import { Star, Quote } from "lucide-react";
import { REVIEWS } from "@/lib/site-data";

export function Reviews() {
  if (REVIEWS.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-12">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-deep mb-3 font-bold">
          What Guests Are Saying
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink">
          Trusted by Travelers
        </h2>
        <div className="mx-auto mt-5 w-24 divider-gold" />
      </div>

      <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
        {REVIEWS.map((r, idx) => (
          <article
            key={idx}
            className="relative rounded-xl bg-white ring-1 ring-line p-6 sm:p-7 flex flex-col"
          >
            <Quote
              className="absolute -top-3 left-6 w-8 h-8 text-gold/30 fill-gold/15"
              aria-hidden
            />
            <Stars rating={r.rating} />
            <blockquote className="mt-4 text-charcoal/85 leading-relaxed text-sm sm:text-[15px] flex-1">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <footer className="mt-5 pt-4 border-t border-line">
              <div className="font-serif italic text-base text-gold-deep">
                {r.guest}
              </div>
              <div className="text-xs text-charcoal/70 mt-0.5">
                {r.location}
              </div>
              <div className="text-[11px] text-muted mt-1">{r.stay}</div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "text-gold fill-gold"
              : "text-line fill-line"
          }`}
        />
      ))}
    </div>
  );
}
