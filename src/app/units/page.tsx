import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BedDouble, Bath, Users } from "lucide-react";
import { listUnits } from "@/lib/db";

export const revalidate = 0;

export const metadata = {
  title: "Featured Units | Golden Key Retreats",
  description:
    "Browse Golden Key Retreats' featured short-term rental units across Miami and Fort Lauderdale.",
};

export default async function UnitsPage() {
  const units = await listUnits().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-12">
        <p className="text-[10px] sm:text-xs tracking-[0.32em] uppercase text-gold-deep mb-3">
          Our Properties
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink">
          Featured Units
        </h1>
        <div className="mx-auto mt-5 w-24 divider-gold" />
        <p className="mt-5 text-sm sm:text-base text-charcoal/75 max-w-2xl mx-auto">
          Each Golden Key Retreats stay is hand-prepared by Natalie and her team
          for a clean, elevated experience. Tap a unit to see photos, included
          services, and details.
        </p>
      </div>

      {units.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-12 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl text-ink mb-2">
            New units on the way
          </h2>
          <p className="text-charcoal/70">
            We&apos;re preparing our first listings — check back soon, or reach
            out directly.
          </p>
          <Link
            href="/contact"
            className="mt-6 btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm"
          >
            Contact Natalie <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {units.map((u) => (
            <Link
              key={u.id}
              href={`/units/${u.id}`}
              className="group rounded-xl overflow-hidden bg-white ring-1 ring-line hover:ring-gold transition-all flex flex-col"
            >
              <div className="aspect-[4/3] relative bg-cream-soft">
                {u.coverImageUrl ? (
                  <Image
                    src={u.coverImageUrl}
                    alt={u.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold-deep text-xs tracking-[0.3em] uppercase">
                    No Photo Yet
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs tracking-[0.25em] uppercase text-gold-deep mb-1">
                  {u.location}
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">{u.name}</h3>
                {u.shortDescription && (
                  <p className="text-sm text-charcoal/75 leading-relaxed line-clamp-2 mb-4">
                    {u.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-charcoal/75 mt-auto pt-4 border-t border-line">
                  {u.bedrooms != null && (
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-gold-deep" />
                      {u.bedrooms} bd
                    </span>
                  )}
                  {u.bathrooms != null && (
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-gold-deep" />
                      {u.bathrooms} ba
                    </span>
                  )}
                  {u.maxGuests != null && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gold-deep" />
                      up to {u.maxGuests}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-gold-deep group-hover:translate-x-0.5 transition-transform">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
