// Client-safe constants shared by both server and client components.
// Anything imported by a `"use client"` file cannot come from operations.ts
// itself because that module pulls in the `postgres` driver.

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Repairs & Maintenance",
  "Cleaning",
  "Supplies",
  "Furniture",
  "Insurance",
  "Licenses & Permits",
  "Property Tax",
  "HOA",
  "Marketing",
  "Software & Subscriptions",
  "Professional Services",
  "Travel",
  "Meals",
  "Bank & Payment Fees",
  "Other",
] as const;

export const TAX_DOCUMENT_CATEGORIES = [
  "Income Forms (1099)",
  "Property Documents",
  "Mortgage / Rent Statements",
  "Insurance",
  "Business Documents",
  "Licenses & Permits",
  "Quarterly Estimates",
  "Prior Year Return",
  "Bank Statements",
  "Deduction Support",
  "Other",
] as const;
