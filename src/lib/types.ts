export type Unit = {
  id: string;
  name: string;
  location: string;
  shortDescription: string;
  fullDescription: string;
  coverImageUrl: string | null;
  photoUrls: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
  pricePerNight: number | null;
  amenities: string[];
  services: string[];
  bookingUrl: string | null;
  createdAt: string;
};

export type UnitInput = Omit<Unit, "id" | "createdAt">;
