import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Bath,
  Users,
  MapPin,
  ArrowLeft,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { getUnit } from "@/lib/db";
import type { Unit } from "@/lib/types";

export const revalidate = 0;

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = await getUnit(id).catch(() => null);
  if (!unit) notFound();

  const allPhotos = [
    ...(unit.coverImageUrl ? [unit.coverImageUrl] : []),
    ...unit.photoUrls.filter((p) => p !== unit.coverImageUrl),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <Link
        href="/units"
        className="inline-flex items-center gap-2 text-sm text-charcoal hover:text-gold-deep mb-6 sm:mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Featured Units
      </Link>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-12">
        <div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-cream-soft ring-1 ring-line relative">
            {allPhotos[0] ? (
              <Image
                src={allPhotos[0]}
                alt={unit.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold-deep text-xs tracking-[0.3em] uppercase">
                No Photo Yet
              </div>
            )}
          </div>
          {allPhotos.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {allPhotos.slice(1, 5).map((src, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md overflow-hidden bg-cream-soft ring-1 ring-line relative"
                >
                  <Image
                    src={src}
                    alt={`${unit.name} photo ${i + 2}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-gold-deep mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {unit.location}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mb-4">
            {unit.name}
          </h1>
          {unit.shortDescription && (
            <p className="text-charcoal/80 leading-relaxed mb-6">
              {unit.shortDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-6 py-4 border-y border-line mb-6">
            {unit.bedrooms != null && (
              <Stat
                icon={<BedDouble className="w-4 h-4" />}
                label="Bedrooms"
                value={unit.bedrooms.toString()}
              />
            )}
            {unit.bathrooms != null && (
              <Stat
                icon={<Bath className="w-4 h-4" />}
                label="Bathrooms"
                value={unit.bathrooms.toString()}
              />
            )}
            {unit.maxGuests != null && (
              <Stat
                icon={<Users className="w-4 h-4" />}
                label="Sleeps"
                value={`up to ${unit.maxGuests}`}
              />
            )}
            {unit.pricePerNight != null && (
              <Stat
                label="From"
                value={`$${unit.pricePerNight}/night`}
              />
            )}
          </div>

          <UnitBookingPanel unit={unit} />
        </div>
      </div>

      {unit.fullDescription && (
        <section className="bg-white rounded-xl ring-1 ring-line p-6 sm:p-8 mb-8 sm:mb-10">
          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-4">About This Stay</h2>
          <div className="prose prose-sm max-w-none text-charcoal/85 leading-relaxed whitespace-pre-line">
            {unit.fullDescription}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {unit.amenities.length > 0 && (
          <ListBlock
            title="Amenities"
            items={unit.amenities}
            icon={<Check className="w-4 h-4" />}
          />
        )}
        {unit.services.length > 0 && (
          <ListBlock
            title="Services Included"
            items={unit.services}
            icon={<Sparkles className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
}

function UnitBookingPanel({ unit }: { unit: Unit }) {
  const platforms = [
    {
      name: "Airbnb",
      url: unit.airbnbUrl,
      bg: "bg-[#FF5A5F] hover:bg-[#e94e53]",
    },
    {
      name: "VRBO",
      url: unit.vrboUrl,
      bg: "bg-[#1668E3] hover:bg-[#125ac9]",
    },
    {
      name: "Booking.com",
      url: unit.bookingComUrl,
      bg: "bg-[#003580] hover:bg-[#002966]",
    },
  ];
  const anyAvailable = platforms.some((p) => p.url);

  return (
    <div className="rounded-xl bg-cream-soft ring-1 ring-line p-5 sm:p-6">
      <div className="text-[10px] sm:text-xs tracking-[0.28em] uppercase text-gold-deep font-bold mb-1.5">
        Book This Stay
      </div>
      <p className="text-sm text-charcoal/75 mb-4">
        {anyAvailable
          ? "Choose your preferred platform — you'll be taken straight to this unit's listing."
          : "Listings going live soon. Reach out below and we'll send the link directly."}
      </p>
      <div className="grid sm:grid-cols-3 gap-2.5">
        {platforms.map((p) =>
          p.url ? (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${p.bg} text-white inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-colors shadow-sm`}
            >
              {p.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div
              key={p.name}
              aria-disabled
              className="border border-line bg-white text-muted inline-flex flex-col items-center justify-center gap-0.5 px-4 py-3 rounded-md text-sm font-medium"
            >
              <span>{p.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-gold-deep/70">
                Coming Soon
              </span>
            </div>
          ),
        )}
      </div>
      <Link
        href="/contact"
        className="mt-4 block text-center text-sm text-gold-deep hover:text-ink underline underline-offset-4"
      >
        Or ask Natalie directly
      </Link>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-gold-deep">{icon}</span>}
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
          {label}
        </div>
        <div className="text-sm font-medium text-ink">{value}</div>
      </div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-6">
      <h2 className="font-serif text-xl text-ink mb-4">{title}</h2>
      <ul className="grid sm:grid-cols-2 gap-y-2.5 gap-x-4">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-charcoal/85"
          >
            <span className="text-gold-deep mt-0.5">{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
