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
      // Link a public listing to a bookkeeping property so admin views can
      // roll up expenses, bookings, etc. Nullable — a listing may exist
      // without a matching operations record and vice versa.
      await sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS property_id TEXT`;

      // Inbox messages — populated by the public contact form, read by
      // /admin/inbox. status: new | read | replied | archived.
      await sql`
        CREATE TABLE IF NOT EXISTS messages (
          id           TEXT PRIMARY KEY,
          name         TEXT NOT NULL,
          email        TEXT NOT NULL,
          phone        TEXT,
          subject      TEXT,
          body         TEXT NOT NULL,
          status       TEXT NOT NULL DEFAULT 'new',
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status)`;
      await sql`CREATE INDEX IF NOT EXISTS messages_created_idx ON messages(created_at DESC)`;

      // ── Operations Sheet tables ───────────────────────────────────
      // properties: master list of arbitrage units
      await sql`
        CREATE TABLE IF NOT EXISTS properties (
          id                  TEXT PRIMARY KEY,
          name                TEXT NOT NULL,
          address             TEXT NOT NULL DEFAULT '',
          monthly_rent_cents  INT,
          beds                INT,
          baths               NUMERIC(3,1),
          amenities           JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // property_items: inventory + budget rolled into one row per item-per-property.
      // status drives the budget tracker (Pending/Ordered/Bought).
      // has_it drives the inventory checkbox (true = stocked at the unit right now).
      await sql`
        CREATE TABLE IF NOT EXISTS property_items (
          id                  TEXT PRIMARY KEY,
          property_id         TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          category            TEXT NOT NULL,
          item                TEXT NOT NULL,
          qty                 INT NOT NULL DEFAULT 1,
          notes               TEXT NOT NULL DEFAULT '',
          budget_cents        INT,
          actual_cost_cents   INT,
          store               TEXT NOT NULL DEFAULT '',
          status              TEXT NOT NULL DEFAULT 'Pending',
          has_it              BOOLEAN NOT NULL DEFAULT FALSE,
          sort_order          INT NOT NULL DEFAULT 0,
          last_purchased_at   TIMESTAMPTZ,
          created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS property_items_property_idx ON property_items(property_id)`;
      await sql`CREATE INDEX IF NOT EXISTS property_items_category_idx ON property_items(property_id, category)`;

      // product_catalog table was removed 2026-07-20 — owner didn't want to
      // track where each item was purchased. Drop the table if it still exists
      // so old data is fully erased. Safe: no FKs pointed at it.
      await sql`DROP TABLE IF EXISTS product_catalog`;

      // bookings: revenue/income tracking per property — answers "what's bringing in money?"
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id                  TEXT PRIMARY KEY,
          property_id         TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          source              TEXT NOT NULL DEFAULT '',
          check_in            DATE NOT NULL,
          check_out           DATE NOT NULL,
          nights              INT NOT NULL DEFAULT 0,
          gross_cents         INT NOT NULL DEFAULT 0,
          cleaning_cents      INT NOT NULL DEFAULT 0,
          platform_fee_cents  INT NOT NULL DEFAULT 0,
          net_cents           INT NOT NULL DEFAULT 0,
          notes               TEXT NOT NULL DEFAULT '',
          created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS bookings_property_idx ON bookings(property_id)`;
      await sql`CREATE INDEX IF NOT EXISTS bookings_checkin_idx ON bookings(check_in DESC)`;

      // Per-property category metadata: rename + per-section budget + display order.
      // Composite PK (property_id, name) means renaming = delete + insert in a tx.
      await sql`
        CREATE TABLE IF NOT EXISTS property_categories (
          property_id   TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          name          TEXT NOT NULL,
          budget_cents  INT,
          sort_order    INT NOT NULL DEFAULT 0,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (property_id, name)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS property_categories_order_idx ON property_categories(property_id, sort_order)`;

      // tax_documents: uploaded PDFs / images for each tax year — 1099s, mortgage
      // statements, quarterly estimates, deeds, permits. property_id nullable
      // because most tax docs are LLC-level, but some are property-specific.
      await sql`
        CREATE TABLE IF NOT EXISTS tax_documents (
          id            TEXT PRIMARY KEY,
          tax_year      INT NOT NULL,
          category      TEXT NOT NULL,
          name          TEXT NOT NULL,
          property_id   TEXT REFERENCES properties(id) ON DELETE SET NULL,
          file_url      TEXT NOT NULL,
          file_name     TEXT NOT NULL DEFAULT '',
          file_size     INT NOT NULL DEFAULT 0,
          notes         TEXT NOT NULL DEFAULT '',
          uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS tax_documents_year_idx ON tax_documents(tax_year DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS tax_documents_category_idx ON tax_documents(category)`;

      // expenses: ongoing operating costs — rent, utilities, repairs, insurance, etc.
      // property_id nullable so LLC-level costs (business insurance, software) can
      // still be tracked. spent_on is the date the expense occurred (drives P&L).
      await sql`
        CREATE TABLE IF NOT EXISTS expenses (
          id            TEXT PRIMARY KEY,
          property_id   TEXT REFERENCES properties(id) ON DELETE SET NULL,
          spent_on      DATE NOT NULL,
          category      TEXT NOT NULL,
          vendor        TEXT NOT NULL DEFAULT '',
          description   TEXT NOT NULL DEFAULT '',
          amount_cents  INT NOT NULL DEFAULT 0,
          receipt_url   TEXT,
          notes         TEXT NOT NULL DEFAULT '',
          created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS expenses_property_idx ON expenses(property_id)`;
      await sql`CREATE INDEX IF NOT EXISTS expenses_spent_on_idx ON expenses(spent_on DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category)`;
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
  property_id: string | null;
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
    propertyId: row.property_id,
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
      airbnb_url, vrbo_url, booking_com_url, property_id
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
      ${input.bookingComUrl},
      ${input.propertyId}
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
      booking_com_url = ${input.bookingComUrl},
      property_id = ${input.propertyId}
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

export { isDbConfigured, getSql, ensureSchema };
