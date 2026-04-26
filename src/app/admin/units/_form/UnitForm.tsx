"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import type { Unit } from "@/lib/types";

type Props = {
  initial?: Unit;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function UnitForm({ initial, action, submitLabel }: Props) {
  const [photos, setPhotos] = useState<string[]>(initial?.photoUrls ?? []);
  const [cover, setCover] = useState<string | null>(
    initial?.coverImageUrl ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removePhoto = (url: string) => {
    setPhotos((p) => p.filter((u) => u !== url));
    if (cover === url) {
      setCover(photos.find((u) => u !== url) ?? null);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const fd = new FormData(e.currentTarget);
        photos.forEach((url) => fd.append("existingPhotos", url));
        if (cover) fd.set("coverImageUrl", cover);
        try {
          await action(fd);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          setSubmitting(false);
        }
      }}
      className="grid lg:grid-cols-3 gap-4 sm:gap-6"
    >
      <div className="lg:col-span-2 space-y-4 sm:space-y-5">
        <Card title="Basics">
          <Field label="Unit Name *" name="name" defaultValue={initial?.name} required />
          <Field
            label="Location *"
            name="location"
            placeholder="e.g. Brickell, Miami"
            defaultValue={initial?.location}
            required
          />
          <Field
            label="Short Description"
            name="shortDescription"
            placeholder="One line summary shown on cards"
            defaultValue={initial?.shortDescription}
          />
          <FieldArea
            label="Full Description"
            name="fullDescription"
            placeholder="Tell guests about the space, neighborhood, vibe..."
            defaultValue={initial?.fullDescription}
            rows={6}
          />
        </Card>

        <Card title="Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Bedrooms"
              name="bedrooms"
              type="number"
              defaultValue={initial?.bedrooms?.toString() ?? ""}
            />
            <Field
              label="Bathrooms"
              name="bathrooms"
              type="number"
              defaultValue={initial?.bathrooms?.toString() ?? ""}
            />
            <Field
              label="Max Guests"
              name="maxGuests"
              type="number"
              defaultValue={initial?.maxGuests?.toString() ?? ""}
            />
            <Field
              label="Price per night ($)"
              name="pricePerNight"
              type="number"
              defaultValue={initial?.pricePerNight?.toString() ?? ""}
            />
          </div>
        </Card>

        <Card title="Booking Links">
          <p className="text-xs text-muted -mt-2">
            Paste this unit&rsquo;s URL on each platform you list it. Empty
            fields show as &ldquo;Coming Soon&rdquo; on the unit page.
          </p>
          <Field
            label="Airbnb URL"
            name="airbnbUrl"
            placeholder="https://www.airbnb.com/rooms/..."
            defaultValue={initial?.airbnbUrl ?? ""}
          />
          <Field
            label="VRBO URL"
            name="vrboUrl"
            placeholder="https://www.vrbo.com/..."
            defaultValue={initial?.vrboUrl ?? ""}
          />
          <Field
            label="Booking.com URL"
            name="bookingComUrl"
            placeholder="https://www.booking.com/hotel/..."
            defaultValue={initial?.bookingComUrl ?? ""}
          />
        </Card>

        <Card title="Amenities & Services">
          <FieldArea
            label="Amenities (one per line)"
            name="amenities"
            placeholder={"Smart TV\nPool access\nFully stocked kitchen"}
            defaultValue={(initial?.amenities ?? []).join("\n")}
            rows={5}
          />
          <FieldArea
            label="Services included with this stay (one per line)"
            name="services"
            placeholder={"Professional cleaning between stays\nFresh linens & towels\nHigh-speed Wi-Fi"}
            defaultValue={(initial?.services ?? []).join("\n")}
            rows={5}
          />
        </Card>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <Card title="Photos">
          <input
            type="file"
            name="newPhotos"
            multiple
            accept="image/*"
            className="block w-full text-sm text-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-gold/15 file:px-3 file:py-2 file:text-gold-deep hover:file:bg-gold/25"
          />
          <p className="text-xs text-muted mt-2">
            Photos upload to Vercel Blob. The first photo is used as the cover
            unless you select one below.
          </p>

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {photos.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-md overflow-hidden ring-1 ring-line bg-cream-soft group"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-between p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setCover(url)}
                      title={cover === url ? "Cover photo" : "Set as cover"}
                      className={`p-1 rounded ${cover === url ? "bg-gold text-white" : "bg-white/90 text-charcoal"}`}
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        fill={cover === url ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="p-1 rounded bg-white/90 text-red-600 hover:bg-red-50"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {cover === url && (
                    <span className="absolute top-1.5 left-1.5 bg-gold text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="bg-white rounded-xl ring-1 ring-line p-5">
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full px-4 py-3 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Saving..." : submitLabel}
          </button>
          <Link
            href="/admin/units"
            className="block text-center text-xs text-muted mt-3 hover:text-gold-deep"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-5 space-y-4">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-charcoal mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-cream-soft px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

function FieldArea({
  label,
  name,
  defaultValue,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-charcoal mb-1.5 block">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows ?? 4}
        className="w-full rounded-md border border-line bg-cream-soft px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}
