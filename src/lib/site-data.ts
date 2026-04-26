import {
  SprayCan,
  BedSingle,
  Wifi,
  Car,
  Bath,
  Coffee,
  KeyRound,
  Headphones,
} from "lucide-react";

export type Review = {
  quote: string;
  guest: string; // e.g. "Sarah M."
  location: string; // e.g. "Visiting from Atlanta"
  stay: string; // e.g. "Brickell Stay · Mar 2026"
  rating: 1 | 2 | 3 | 4 | 5;
};

// Edit / replace these as real reviews come in.
export const REVIEWS: Review[] = [
  {
    quote:
      "The space was spotless when we arrived and felt like a true escape. Natalie was responsive and made check-in effortless — we'll be back.",
    guest: "Sarah M.",
    location: "Visiting from Atlanta",
    stay: "Family weekend · 2 nights",
    rating: 5,
  },
  {
    quote:
      "Easily the cleanest short-term rental we've stayed in. Thoughtful touches everywhere and a quiet workspace that made remote days easy.",
    guest: "James & Carolina",
    location: "Visiting from New York",
    stay: "Work trip · 5 nights",
    rating: 5,
  },
  {
    quote:
      "Felt like a hotel without losing the comfort of a home. Communication was prompt and everything was exactly as described.",
    guest: "Daniela R.",
    location: "Visiting from Bogotá",
    stay: "Anniversary stay · 3 nights",
    rating: 5,
  },
];

// Preview "Coming Soon" unit cards shown in the Featured Units carousel
// when no real units exist yet. Replace with real units in /admin.
export type PreviewUnit = {
  neighborhood: string;
  vibe: string; // 1-line teaser
  cover: string; // path under /public
};

export const PREVIEW_UNITS: PreviewUnit[] = [
  {
    neighborhood: "Brickell",
    vibe: "Skyline-view stays in the heart of Miami's financial district.",
    cover: "/preview-brickell.png",
  },
  {
    neighborhood: "South Beach",
    vibe: "Steps from the sand, designed for sunlit weekends.",
    cover: "/preview-south-beach.png",
  },
  {
    neighborhood: "Coral Gables",
    vibe: "Quiet, leafy retreats with old-Florida charm.",
    cover: "/preview-coral-gables.png",
  },
  {
    neighborhood: "Wynwood",
    vibe: "Art-district stays walking distance to galleries and cafés.",
    cover: "/preview-wynwood.png",
  },
  {
    neighborhood: "Miami Beach",
    vibe: "Coastal escapes with breezy, modern interiors.",
    cover: "/preview-miami-beach.png",
  },
];

export type BookingPlatform = {
  name: string;
  url: string | null; // null means "not set up yet" — will show as Coming soon
  accent: string; // brand color, used as small swatch in the menu
};

// Edit these URLs as you go live on each platform.
// Use the URL of your host profile page or a specific listing.
export const BOOKING_PLATFORMS: BookingPlatform[] = [
  { name: "Airbnb", url: null, accent: "#FF5A5F" },
  { name: "VRBO", url: null, accent: "#1668E3" },
  { name: "Booking.com", url: null, accent: "#003580" },
];

export const HOMEPAGE_SERVICES = [
  {
    icon: SprayCan,
    title: "Professional Cleaning",
    body: "Deep-cleaned and sanitized between every guest by our trusted team.",
  },
  {
    icon: BedSingle,
    title: "Fresh Linens & Towels",
    body: "Hotel-quality linens, plush towels, and made-up beds on arrival.",
  },
  {
    icon: Bath,
    title: "Starter Toiletries",
    body: "Shampoo, conditioner, body wash, and hand soap stocked for you.",
  },
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi",
    body: "Fast, secure internet ready to use the moment you walk in.",
  },
  {
    icon: Coffee,
    title: "Kitchen Essentials",
    body: "Coffee, filters, basic spices, and starter supplies in every kitchen.",
  },
  {
    icon: Car,
    title: "Parking Information",
    body: "Clear parking instructions and on-site or street options as available.",
  },
  {
    icon: KeyRound,
    title: "Self Check-In",
    body: "Smart-lock or keypad access — no waiting, no stress on arrival.",
  },
  {
    icon: Headphones,
    title: "Direct Host Support",
    body: "Contact your host directly throughout your stay for prompt assistance with anything you may need.",
  },
];

export const HOUSE_RULES = [
  {
    title: "No Smoking Indoors",
    body: "Smoking and vaping of any kind are not permitted inside the unit. Designated outdoor areas only.",
  },
  {
    title: "Quiet Hours: 10 PM – 8 AM",
    body: "Please respect neighbors during quiet hours. No loud music or gatherings outside this window.",
  },
  {
    title: "Maximum Occupancy",
    body: "Stays are limited to the booked number of guests. Unregistered guests and overnight visitors are not allowed.",
  },
  {
    title: "No Parties or Events",
    body: "Gatherings, parties, and events of any size are strictly prohibited.",
  },
  {
    title: "No Pets",
    body: "Our units are pet-free to maintain allergy-friendly, spotless interiors.",
  },
  {
    title: "Check-In & Check-Out",
    body: "Check-in is after 4:00 PM. Check-out is by 11:00 AM. Early/late requests can be accommodated when available.",
  },
  {
    title: "Treat the Space with Care",
    body: "Please treat the home as you would your own. Damages or excessive cleaning needs may result in additional charges.",
  },
  {
    title: "Follow Building & HOA Rules",
    body: "Some properties have community-specific guidelines (pool hours, gym access, etc.) — these will be shared in your check-in instructions.",
  },
];
