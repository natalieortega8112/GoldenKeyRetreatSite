import postgres from "postgres";
import type { Unit, UnitInput } from "./types";

function getConnectionString(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    null
  );
}

function isDbConfigured() {
  return Boolean(getConnectionString());
}

declare global {
  // eslint-disable-next-line no-var
  var __gkr_sql: ReturnType<typeof postgres> | undefined;
}

function getSql() {
  if (!global.__gkr_sql) {
    const url = getConnectionString();
    if (!url) throw new Error("Database is not configured");
    global.__gkr_sql = postgres(url, {
      ssl: "require",
      prepare: false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return global.__gkr_sql;
}

let initPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!isDbConfigured()) return;
  if (!initPromise) {
    const sql = getSql();
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS units (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          short_description TEXT NOT NULL DEFAULT '',
          full_description TEXT NOT NULL DEFAULT '',
          cover_image_url TEXT,
          photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
          bedrooms INT,
          bathrooms INT,
          max_guests INT,
          price_per_night INT,
          amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
          services JSONB NOT NULL DEFAULT '[]'::jsonb,
          booking_url TEXT,
          airbnb_url TEXT,
          vrbo_url TEXT,
          booking_com_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      // Idempotent migrations for older deployments
      await sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS airbnb_url TEXT`;
      await sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS vrbo_url TEXT`;
      await sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS booking_com_url TEXT`;
    })();
  }
  await initPromise;
}

type UnitRow = {
  id: string;
  name: string;
  location: string;
  short_description: string;
  full_description: string;
  cover_image_url: string | null;
  photo_urls: string[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  price_per_night: number | null;
  amenities: string[] | null;
  services: string[] | null;
  booking_url: string | null;
  airbnb_url: string | null;
  vrbo_url: string | null;
  booking_com_url: string | null;
  created_at: string | Date;
};

function rowToUnit(row: UnitRow): Unit {
  const created = row.created_at;
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    coverImageUrl: row.cover_image_url,
    photoUrls: row.photo_urls ?? [],
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    maxGuests: row.max_guests,
    pricePerNight: row.price_per_night,
    amenities: row.amenities ?? [],
    services: row.services ?? [],
    bookingUrl: row.booking_url,
    airbnbUrl: row.airbnb_url,
    vrboUrl: row.vrbo_url,
    bookingComUrl: row.booking_com_url,
    createdAt:
      created instanceof Date ? created.toISOString() : String(created),
  };
}

export async function listUnits(): Promise<Unit[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<UnitRow[]>`
    SELECT * FROM units ORDER BY created_at DESC
  `;
  return rows.map(rowToUnit);
}

export async function getUnit(id: string): Promise<Unit | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<UnitRow[]>`
    SELECT * FROM units WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToUnit(rows[0]) : null;
}

function genId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

export async function createUnit(input: UnitInput): Promise<Unit> {
  if (!isDbConfigured()) {
    throw new Error(
      "Database is not configured. Set POSTGRES_URL in your environment.",
    );
  }
  await ensureSchema();
  const sql = getSql();
  const id = genId();
  await sql`
    INSERT INTO units (
      id, name, location, short_description, full_description,
      cover_image_url, photo_urls, bedrooms, bathrooms, max_guests,
      price_per_night, amenities, services, booking_url,
      airbnb_url, vrbo_url, booking_com_url
    ) VALUES (
      ${id},
      ${input.name},
      ${input.location},
      ${input.shortDescription},
      ${input.fullDescription},
      ${input.coverImageUrl},
      ${sql.json(input.photoUrls)},
      ${input.bedrooms},
      ${input.bathrooms},
      ${input.maxGuests},
      ${input.pricePerNight},
      ${sql.json(input.amenities)},
      ${sql.json(input.services)},
      ${input.bookingUrl},
      ${input.airbnbUrl},
      ${input.vrboUrl},
      ${input.bookingComUrl}
    )
  `;
  const created = await getUnit(id);
  if (!created) throw new Error("Failed to create unit");
  return created;
}

export async function updateUnit(
  id: string,
  input: UnitInput,
): Promise<Unit | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE units SET
      name = ${input.name},
      location = ${input.location},
      short_description = ${input.shortDescription},
      full_description = ${input.fullDescription},
      cover_image_url = ${input.coverImageUrl},
      photo_urls = ${sql.json(input.photoUrls)},
      bedrooms = ${input.bedrooms},
      bathrooms = ${input.bathrooms},
      max_guests = ${input.maxGuests},
      price_per_night = ${input.pricePerNight},
      amenities = ${sql.json(input.amenities)},
      services = ${sql.json(input.services)},
      booking_url = ${input.bookingUrl},
      airbnb_url = ${input.airbnbUrl},
      vrbo_url = ${input.vrboUrl},
      booking_com_url = ${input.bookingComUrl}
    WHERE id = ${id}
  `;
  return getUnit(id);
}

export async function deleteUnit(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM units WHERE id = ${id}`;
}

export { isDbConfigured };
