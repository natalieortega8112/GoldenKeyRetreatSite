"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  Bath,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Unit } from "@/lib/types";

export function FeaturedUnits({ units }: { units: Unit[] }) {
  return (
    <section
      id="featured-units"
      className="relative bg-ink text-cream overflow-hidden scroll-mt-36"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] sm:text-xs tracking-[0.32em] uppercase text-gold-soft mb-3 font-bold">
            Our Properties
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cream">
            Featured Units
          </h2>
          <div className="mx-auto mt-5 w-24 h-px bg-gold/70" />
        </div>

        {units.length === 0 ? (
          <EmptyState />
        ) : (
          <UnitsCarousel units={units} />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-charcoal/60 ring-1 ring-gold/25 aspect-[4/3] flex flex-col items-center justify-center text-center px-6"
        >
          <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-soft mb-2">
            Coming Soon
          </span>
          <span className="font-serif text-lg sm:text-xl text-cream">
            New unit on the way
          </span>
        </div>
      ))}
    </div>
  );
}

function UnitsCarousel({ units }: { units: Unit[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function update() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [units.length]);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  const showArrows = units.length > 1;

  return (
    <div className="relative">
      {showArrows && (
        <>
          <ArrowButton
            side="left"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          />
          <ArrowButton
            side="right"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          />
        </>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {units.map((u) => (
          <div
            key={u.id}
            data-card
            className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
          >
            <UnitCard unit={u} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrowButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous unit" : "Next unit"}
      className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-cream text-ink shadow-lg shadow-black/30 ring-1 ring-gold/40 items-center justify-center transition-all hover:bg-white hover:scale-105 disabled:opacity-0 disabled:pointer-events-none ${
        side === "left" ? "-left-3 lg:-left-5" : "-right-3 lg:-right-5"
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  return (
    <Link
      href={`/units/${unit.id}`}
      className="group rounded-xl overflow-hidden bg-charcoal/70 ring-1 ring-gold/30 hover:ring-gold transition-all flex flex-col h-full"
    >
      <div className="aspect-[4/3] relative bg-charcoal">
        {unit.coverImageUrl ? (
          <Image
            src={unit.coverImageUrl}
            alt={unit.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold-soft text-xs tracking-[0.3em] uppercase">
            No Photo Yet
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-gold-soft mb-1">
          {unit.location}
        </div>
        <h3 className="font-serif text-lg sm:text-xl text-cream mb-2">
          {unit.name}
        </h3>
        {unit.shortDescription && (
          <p className="text-sm text-cream/70 leading-relaxed line-clamp-2 mb-4">
            {unit.shortDescription}
          </p>
        )}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-cream/70 mt-auto pt-4 border-t border-gold/20">
          {unit.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-gold" />
              {unit.bedrooms} bd
            </span>
          )}
          {unit.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-gold" />
              {unit.bathrooms} ba
            </span>
          )}
          {unit.maxGuests != null && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold" />
              up to {unit.maxGuests}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-gold group-hover:translate-x-0.5 transition-transform">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
