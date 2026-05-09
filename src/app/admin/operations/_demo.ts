// Demo data for the operations dashboard. Activated by ?demo=1 on
// /admin/operations so Natalie can show a populated dashboard
// without needing real properties, inventory, or bookings in the DB.
//
// Numbers are believable for Miami short-term rentals so screenshots /
// walk-throughs feel real, but nothing here is persisted.

import type { PropertySummary } from "@/lib/operations";

export const DEMO_SUMMARIES: PropertySummary[] = [
  {
    property: {
      id: "demo-brickell",
      name: "Brickell Skyline 1BR",
      address: "1080 Brickell Ave · Miami, FL",
      monthlyRentCents: 380_000,
      beds: 1,
      baths: 1,
      amenities: ["Pool", "Gym", "Doorman", "City View"],
      createdAt: "2026-01-04T00:00:00Z",
    },
    itemCount: 38,
    itemsHave: 35,
    totalBudgetCents: 420_000,
    totalSpentCents: 395_000,
    bookingCount: 12,
    grossRevenueCents: 2_410_000,
    netRevenueCents: 1_905_000,
  },
  {
    property: {
      id: "demo-coral-gables",
      name: "Coral Gables Casita",
      address: "2845 Coconut Grove Dr · Coral Gables, FL",
      monthlyRentCents: 450_000,
      beds: 2,
      baths: 2,
      amenities: ["Backyard", "Parking", "Washer/Dryer"],
      createdAt: "2026-02-10T00:00:00Z",
    },
    itemCount: 47,
    itemsHave: 41,
    totalBudgetCents: 580_000,
    totalSpentCents: 512_000,
    bookingCount: 9,
    grossRevenueCents: 1_820_000,
    netRevenueCents: 1_408_000,
  },
  {
    property: {
      id: "demo-wynwood",
      name: "Wynwood Loft Studio",
      address: "175 NW 26th St · Miami, FL",
      monthlyRentCents: 290_000,
      beds: 0,
      baths: 1,
      amenities: ["Rooftop", "Walkable"],
      createdAt: "2026-03-22T00:00:00Z",
    },
    itemCount: 26,
    itemsHave: 24,
    totalBudgetCents: 285_000,
    totalSpentCents: 261_000,
    bookingCount: 14,
    grossRevenueCents: 1_650_000,
    netRevenueCents: 1_298_000,
  },
];
