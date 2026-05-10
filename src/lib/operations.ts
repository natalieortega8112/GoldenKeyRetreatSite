// Data layer for the Operations Sheet — properties, inventory + budget rows,
// product link catalog, and bookings. Re-uses the postgres connection from db.ts.
import { ensureSchema, getSql, isDbConfigured } from "./db";

// ─── Types ───────────────────────────────────────────────────

export type Property = {
  id: string;
  name: string;
  address: string;
  monthlyRentCents: number | null;
  beds: number | null;
  baths: number | null;
  amenities: string[];
  createdAt: string;
};

export type PropertyInput = Omit<Property, "id" | "createdAt">;

export type PropertyItemStatus = "Pending" | "Ordered" | "Bought";

export type PropertyItem = {
  id: string;
  propertyId: string;
  category: string;
  item: string;
  qty: number;
  notes: string;
  budgetCents: number | null;
  actualCostCents: number | null;
  store: string;
  status: PropertyItemStatus;
  hasIt: boolean;
  sortOrder: number;
  lastPurchasedAt: string | null;
  createdAt: string;
};

export type PropertyItemInput = Omit<
  PropertyItem,
  "id" | "createdAt" | "lastPurchasedAt"
> & { lastPurchasedAt?: string | null };

export type ProductCatalogEntry = {
  id: string;
  category: string;
  item: string;
  brand: string;
  store: string;
  linkUrl: string;
  priceCents: number | null;
  notes: string;
  lastVerifiedAt: string | null;
  createdAt: string;
};

export type ProductCatalogInput = Omit<ProductCatalogEntry, "id" | "createdAt">;

export type Booking = {
  id: string;
  propertyId: string;
  source: string;
  checkIn: string; // ISO date (YYYY-MM-DD)
  checkOut: string;
  nights: number;
  grossCents: number;
  cleaningCents: number;
  platformFeeCents: number;
  netCents: number;
  notes: string;
  createdAt: string;
};

export type BookingInput = Omit<Booking, "id" | "createdAt">;

// ─── ID generation ───────────────────────────────────────────
function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

function isoOrNull(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function isoDate(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// ─── Property mappers + CRUD ─────────────────────────────────
type PropertyRow = {
  id: string;
  name: string;
  address: string;
  monthly_rent_cents: number | null;
  beds: number | null;
  baths: string | number | null;
  amenities: string[] | null;
  created_at: string | Date;
};

function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    monthlyRentCents: row.monthly_rent_cents,
    beds: row.beds,
    baths: row.baths == null ? null : Number(row.baths),
    amenities: row.amenities ?? [],
    createdAt: isoOrNull(row.created_at) ?? new Date().toISOString(),
  };
}

export async function listProperties(): Promise<Property[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<PropertyRow[]>`
    SELECT * FROM properties ORDER BY created_at ASC
  `;
  return rows.map(rowToProperty);
}

export async function getProperty(id: string): Promise<Property | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<PropertyRow[]>`
    SELECT * FROM properties WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToProperty(rows[0]) : null;
}

export async function createProperty(
  input: PropertyInput,
): Promise<Property> {
  if (!isDbConfigured()) {
    throw new Error("Database is not configured.");
  }
  await ensureSchema();
  const sql = getSql();
  const id = genId();
  await sql`
    INSERT INTO properties (
      id, name, address, monthly_rent_cents, beds, baths, amenities
    ) VALUES (
      ${id},
      ${input.name},
      ${input.address},
      ${input.monthlyRentCents},
      ${input.beds},
      ${input.baths},
      ${sql.json(input.amenities)}
    )
  `;
  // Seed inventory items for the new property using the default template.
  await seedPropertyItems(id);
  const created = await getProperty(id);
  if (!created) throw new Error("Failed to create property");
  return created;
}

export async function updateProperty(
  id: string,
  input: PropertyInput,
): Promise<Property | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE properties SET
      name = ${input.name},
      address = ${input.address},
      monthly_rent_cents = ${input.monthlyRentCents},
      beds = ${input.beds},
      baths = ${input.baths},
      amenities = ${sql.json(input.amenities)}
    WHERE id = ${id}
  `;
  return getProperty(id);
}

export async function deleteProperty(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM properties WHERE id = ${id}`;
}

// ─── PropertyItem mappers + CRUD ─────────────────────────────
type PropertyItemRow = {
  id: string;
  property_id: string;
  category: string;
  item: string;
  qty: number;
  notes: string;
  budget_cents: number | null;
  actual_cost_cents: number | null;
  store: string;
  status: string;
  has_it: boolean;
  sort_order: number;
  last_purchased_at: string | Date | null;
  created_at: string | Date;
};

function rowToPropertyItem(row: PropertyItemRow): PropertyItem {
  const status = (row.status as PropertyItemStatus) ?? "Pending";
  return {
    id: row.id,
    propertyId: row.property_id,
    category: row.category,
    item: row.item,
    qty: row.qty,
    notes: row.notes,
    budgetCents: row.budget_cents,
    actualCostCents: row.actual_cost_cents,
    store: row.store,
    status,
    hasIt: row.has_it,
    sortOrder: row.sort_order,
    lastPurchasedAt: isoOrNull(row.last_purchased_at),
    createdAt: isoOrNull(row.created_at) ?? new Date().toISOString(),
  };
}

export async function listPropertyItems(
  propertyId?: string,
): Promise<PropertyItem[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = propertyId
    ? await sql<PropertyItemRow[]>`
        SELECT * FROM property_items
        WHERE property_id = ${propertyId}
        ORDER BY category ASC, sort_order ASC, created_at ASC
      `
    : await sql<PropertyItemRow[]>`
        SELECT * FROM property_items
        ORDER BY property_id ASC, category ASC, sort_order ASC, created_at ASC
      `;
  return rows.map(rowToPropertyItem);
}

export async function createPropertyItem(
  input: PropertyItemInput,
): Promise<PropertyItem> {
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await ensureSchema();
  const sql = getSql();
  const id = genId();
  await sql`
    INSERT INTO property_items (
      id, property_id, category, item, qty, notes,
      budget_cents, actual_cost_cents, store, status, has_it, sort_order,
      last_purchased_at
    ) VALUES (
      ${id},
      ${input.propertyId},
      ${input.category},
      ${input.item},
      ${input.qty},
      ${input.notes},
      ${input.budgetCents},
      ${input.actualCostCents},
      ${input.store},
      ${input.status},
      ${input.hasIt},
      ${input.sortOrder},
      ${input.lastPurchasedAt ?? null}
    )
  `;
  const rows = await sql<PropertyItemRow[]>`
    SELECT * FROM property_items WHERE id = ${id} LIMIT 1
  `;
  if (!rows[0]) throw new Error("Failed to create property item");
  return rowToPropertyItem(rows[0]);
}

export async function updatePropertyItem(
  id: string,
  input: Partial<PropertyItemInput>,
): Promise<PropertyItem | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  // Read current row, merge, then overwrite. Cheap for our scale.
  const current = await sql<PropertyItemRow[]>`
    SELECT * FROM property_items WHERE id = ${id} LIMIT 1
  `;
  if (!current[0]) return null;
  const cur = rowToPropertyItem(current[0]);
  const next: PropertyItemInput = {
    propertyId: input.propertyId ?? cur.propertyId,
    category: input.category ?? cur.category,
    item: input.item ?? cur.item,
    qty: input.qty ?? cur.qty,
    notes: input.notes ?? cur.notes,
    budgetCents:
      input.budgetCents !== undefined ? input.budgetCents : cur.budgetCents,
    actualCostCents:
      input.actualCostCents !== undefined
        ? input.actualCostCents
        : cur.actualCostCents,
    store: input.store ?? cur.store,
    status: input.status ?? cur.status,
    hasIt: input.hasIt ?? cur.hasIt,
    sortOrder: input.sortOrder ?? cur.sortOrder,
    lastPurchasedAt:
      input.lastPurchasedAt !== undefined
        ? input.lastPurchasedAt
        : cur.lastPurchasedAt,
  };
  await sql`
    UPDATE property_items SET
      category = ${next.category},
      item = ${next.item},
      qty = ${next.qty},
      notes = ${next.notes},
      budget_cents = ${next.budgetCents},
      actual_cost_cents = ${next.actualCostCents},
      store = ${next.store},
      status = ${next.status},
      has_it = ${next.hasIt},
      sort_order = ${next.sortOrder},
      last_purchased_at = ${next.lastPurchasedAt ?? null}
    WHERE id = ${id}
  `;
  const rows = await sql<PropertyItemRow[]>`
    SELECT * FROM property_items WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToPropertyItem(rows[0]) : null;
}

export async function deletePropertyItem(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM property_items WHERE id = ${id}`;
}

// ─── ProductCatalog mappers + CRUD ───────────────────────────
type ProductCatalogRow = {
  id: string;
  category: string;
  item: string;
  brand: string;
  store: string;
  link_url: string;
  price_cents: number | null;
  notes: string;
  last_verified_at: string | Date | null;
  created_at: string | Date;
};

function rowToCatalog(row: ProductCatalogRow): ProductCatalogEntry {
  return {
    id: row.id,
    category: row.category,
    item: row.item,
    brand: row.brand,
    store: row.store,
    linkUrl: row.link_url,
    priceCents: row.price_cents,
    notes: row.notes,
    lastVerifiedAt: isoOrNull(row.last_verified_at),
    createdAt: isoOrNull(row.created_at) ?? new Date().toISOString(),
  };
}

export async function listCatalog(): Promise<ProductCatalogEntry[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<ProductCatalogRow[]>`
    SELECT * FROM product_catalog ORDER BY category ASC, item ASC
  `;
  return rows.map(rowToCatalog);
}

export async function createCatalogEntry(
  input: ProductCatalogInput,
): Promise<ProductCatalogEntry> {
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await ensureSchema();
  const sql = getSql();
  const id = genId();
  await sql`
    INSERT INTO product_catalog (
      id, category, item, brand, store, link_url, price_cents, notes, last_verified_at
    ) VALUES (
      ${id},
      ${input.category},
      ${input.item},
      ${input.brand},
      ${input.store},
      ${input.linkUrl},
      ${input.priceCents},
      ${input.notes},
      ${input.lastVerifiedAt ?? null}
    )
  `;
  const rows = await sql<ProductCatalogRow[]>`
    SELECT * FROM product_catalog WHERE id = ${id} LIMIT 1
  `;
  if (!rows[0]) throw new Error("Failed to create catalog entry");
  return rowToCatalog(rows[0]);
}

export async function updateCatalogEntry(
  id: string,
  input: ProductCatalogInput,
): Promise<ProductCatalogEntry | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE product_catalog SET
      category = ${input.category},
      item = ${input.item},
      brand = ${input.brand},
      store = ${input.store},
      link_url = ${input.linkUrl},
      price_cents = ${input.priceCents},
      notes = ${input.notes},
      last_verified_at = ${input.lastVerifiedAt ?? null}
    WHERE id = ${id}
  `;
  const rows = await sql<ProductCatalogRow[]>`
    SELECT * FROM product_catalog WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToCatalog(rows[0]) : null;
}

export async function deleteCatalogEntry(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM product_catalog WHERE id = ${id}`;
}

// ─── Booking mappers + CRUD ──────────────────────────────────
type BookingRow = {
  id: string;
  property_id: string;
  source: string;
  check_in: string | Date;
  check_out: string | Date;
  nights: number;
  gross_cents: number;
  cleaning_cents: number;
  platform_fee_cents: number;
  net_cents: number;
  notes: string;
  created_at: string | Date;
};

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    propertyId: row.property_id,
    source: row.source,
    checkIn: isoDate(row.check_in),
    checkOut: isoDate(row.check_out),
    nights: row.nights,
    grossCents: row.gross_cents,
    cleaningCents: row.cleaning_cents,
    platformFeeCents: row.platform_fee_cents,
    netCents: row.net_cents,
    notes: row.notes,
    createdAt: isoOrNull(row.created_at) ?? new Date().toISOString(),
  };
}

export async function listBookings(propertyId?: string): Promise<Booking[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = propertyId
    ? await sql<BookingRow[]>`
        SELECT * FROM bookings WHERE property_id = ${propertyId}
        ORDER BY check_in DESC
      `
    : await sql<BookingRow[]>`
        SELECT * FROM bookings ORDER BY check_in DESC
      `;
  return rows.map(rowToBooking);
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  if (!isDbConfigured()) throw new Error("Database is not configured.");
  await ensureSchema();
  const sql = getSql();
  const id = genId();
  await sql`
    INSERT INTO bookings (
      id, property_id, source, check_in, check_out, nights,
      gross_cents, cleaning_cents, platform_fee_cents, net_cents, notes
    ) VALUES (
      ${id},
      ${input.propertyId},
      ${input.source},
      ${input.checkIn},
      ${input.checkOut},
      ${input.nights},
      ${input.grossCents},
      ${input.cleaningCents},
      ${input.platformFeeCents},
      ${input.netCents},
      ${input.notes}
    )
  `;
  const rows = await sql<BookingRow[]>`
    SELECT * FROM bookings WHERE id = ${id} LIMIT 1
  `;
  if (!rows[0]) throw new Error("Failed to create booking");
  return rowToBooking(rows[0]);
}

export async function updateBooking(
  id: string,
  input: BookingInput,
): Promise<Booking | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE bookings SET
      property_id = ${input.propertyId},
      source = ${input.source},
      check_in = ${input.checkIn},
      check_out = ${input.checkOut},
      nights = ${input.nights},
      gross_cents = ${input.grossCents},
      cleaning_cents = ${input.cleaningCents},
      platform_fee_cents = ${input.platformFeeCents},
      net_cents = ${input.netCents},
      notes = ${input.notes}
    WHERE id = ${id}
  `;
  const rows = await sql<BookingRow[]>`
    SELECT * FROM bookings WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

export async function deleteBooking(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM bookings WHERE id = ${id}`;
}

// ─── Default item template (seeded into every new property) ──
// Mirrors the lists Nat approved on the spreadsheet previews.
type SeedItem = { item: string; qty: number; notes: string };
const SEED_ITEMS: Record<string, SeedItem[]> = {
  Kitchen: [
    { item: "Plates set", qty: 1, notes: "Set of 8" },
    { item: "Mug set", qty: 1, notes: "Set of 6" },
    { item: "Drinking glass set", qty: 1, notes: "Set of 8" },
    { item: "Wine glasses", qty: 6, notes: "Stemmed" },
    { item: "Utensil set", qty: 1, notes: "Service for 8" },
    { item: "Steak knives", qty: 1, notes: "Set of 6" },
    { item: "Serving utensils", qty: 1, notes: "" },
    { item: "Cutting board", qty: 2, notes: "" },
    { item: "Bottle opener", qty: 1, notes: "" },
    { item: "Measuring cups", qty: 1, notes: "" },
    { item: "Dining table linens", qty: 1, notes: "" },
  ],
  "Pantry / Cleaning": [
    { item: "Salt & pepper", qty: 1, notes: "Shaker set" },
    { item: "Olive oil", qty: 1, notes: "" },
    { item: "Sugar", qty: 1, notes: "" },
    { item: "Coffee pods", qty: 1, notes: "Nespresso" },
    { item: "Tea bags", qty: 1, notes: "Variety" },
    { item: "Paper towels", qty: 2, notes: "" },
    { item: "Dish soap", qty: 1, notes: "" },
    { item: "Trash bags (large)", qty: 1, notes: "Kitchen" },
    { item: "Trash bags (small)", qty: 1, notes: "Bathroom" },
    { item: "Sponge", qty: 3, notes: "" },
    { item: "Laundry detergent", qty: 1, notes: "" },
    { item: "Set of pots", qty: 1, notes: "Stainless" },
    { item: "Mixing bowls", qty: 1, notes: "Set of 3" },
    { item: "Oven mitts", qty: 2, notes: "" },
    { item: "Toaster", qty: 1, notes: "2-slice" },
  ],
  "Bedroom / Sleep": [
    { item: "Mattress", qty: 1, notes: "Queen" },
    { item: "Mattress protector", qty: 1, notes: "Queen" },
    { item: "Mattress sheet set", qty: 2, notes: "Queen, white" },
    { item: "Throw blanket", qty: 1, notes: "" },
    { item: "Decorative pillows", qty: 2, notes: "" },
    { item: "Sleeping pillows", qty: 4, notes: "Standard" },
    { item: "Bed frame", qty: 1, notes: "Queen" },
    { item: "Hangers", qty: 20, notes: "Wood" },
    { item: "Nightstand lamps", qty: 2, notes: "" },
    { item: "Nightstands", qty: 2, notes: "" },
    { item: "Blackout curtains", qty: 1, notes: "Set" },
    { item: "Luggage rack", qty: 1, notes: "" },
    { item: "Full length mirror", qty: 1, notes: "" },
    { item: "Extra blankets", qty: 1, notes: "In closet" },
  ],
  Bathroom: [
    { item: "Bath towels", qty: 4, notes: "White" },
    { item: "Hand towels", qty: 4, notes: "White" },
    { item: "Wash towels (black)", qty: 4, notes: "For makeup" },
    { item: "Bath rugs", qty: 1, notes: "" },
    { item: "Shower curtains", qty: 1, notes: "If needed" },
    { item: "Shower wall hooks", qty: 1, notes: "" },
    { item: "Plunger", qty: 1, notes: "" },
    { item: "Toilet paper", qty: 6, notes: "" },
    { item: "Hair dryer", qty: 1, notes: "Wall-mounted" },
    { item: "Shampoo / cond. / body wash disp.", qty: 1, notes: "Refillable set" },
    { item: "Trash can", qty: 1, notes: "" },
    { item: "Soap bar holder for hands", qty: 1, notes: "" },
    { item: "Toothbrush holder", qty: 1, notes: "" },
  ],
  "Misc / Decor / Safety": [
    { item: "Smoke detector", qty: 1, notes: "Battery-backed" },
    { item: "CO detector", qty: 1, notes: "" },
    { item: "Fire extinguisher", qty: 1, notes: "Kitchen" },
    { item: "Flashlight", qty: 1, notes: "" },
    { item: "Batteries (AA / AAA)", qty: 1, notes: "Pack" },
    { item: "Light bulbs (extra)", qty: 1, notes: "Pack" },
    { item: "Extension cords", qty: 2, notes: "" },
    { item: "Fan", qty: 1, notes: "" },
    { item: "Welcome book / binder", qty: 1, notes: "WiFi, rules" },
    { item: "Wall art", qty: 3, notes: "" },
    { item: "Candles / diffuser", qty: 2, notes: "" },
    { item: "Plants (faux)", qty: 2, notes: "" },
  ],
  "Living Room": [
    { item: "Couch", qty: 1, notes: "" },
    { item: "Decorative pillows", qty: 4, notes: "Couch" },
    { item: "Rug", qty: 1, notes: "Area rug" },
    { item: "Coffee table", qty: 1, notes: "" },
    { item: "Coffee table decoration", qty: 1, notes: "Tray / books" },
    { item: "TV stand", qty: 1, notes: "" },
    { item: "TV stand decorations", qty: 1, notes: "" },
    { item: "TV", qty: 1, notes: "Smart TV" },
    { item: "Corner chair", qty: 1, notes: "Next to couch" },
    { item: "Living room lamp", qty: 1, notes: "Floor lamp" },
  ],
};

export const DEFAULT_CATEGORIES = Object.keys(SEED_ITEMS);

export async function seedPropertyItems(propertyId: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureSchema();
  const sql = getSql();
  let order = 0;
  for (const [category, items] of Object.entries(SEED_ITEMS)) {
    for (const it of items) {
      const id = genId();
      await sql`
        INSERT INTO property_items (
          id, property_id, category, item, qty, notes, sort_order
        ) VALUES (
          ${id},
          ${propertyId},
          ${category},
          ${it.item},
          ${it.qty},
          ${it.notes},
          ${order}
        )
      `;
      order += 1;
    }
  }
}

// ─── Aggregations / dashboard helpers ────────────────────────
export type PropertySummary = {
  property: Property;
  itemCount: number;
  itemsHave: number;
  totalBudgetCents: number;
  totalSpentCents: number;
  bookingCount: number;
  grossRevenueCents: number;
  netRevenueCents: number;
};

export async function getPropertySummaries(): Promise<PropertySummary[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<
    Array<{
      property: PropertyRow;
      item_count: number;
      items_have: number;
      total_budget_cents: number;
      total_spent_cents: number;
      booking_count: number;
      gross_revenue_cents: number;
      net_revenue_cents: number;
    }>
  >`
    SELECT
      to_jsonb(p.*) AS property,
      COALESCE(i.item_count, 0)        AS item_count,
      COALESCE(i.items_have, 0)        AS items_have,
      COALESCE(i.total_budget_cents, 0) AS total_budget_cents,
      COALESCE(i.total_spent_cents, 0)  AS total_spent_cents,
      COALESCE(b.booking_count, 0)     AS booking_count,
      COALESCE(b.gross_revenue_cents, 0) AS gross_revenue_cents,
      COALESCE(b.net_revenue_cents, 0)   AS net_revenue_cents
    FROM properties p
    LEFT JOIN (
      SELECT
        property_id,
        COUNT(*)::int AS item_count,
        COUNT(*) FILTER (WHERE has_it)::int AS items_have,
        COALESCE(SUM(budget_cents), 0)::int AS total_budget_cents,
        COALESCE(SUM(actual_cost_cents), 0)::int AS total_spent_cents
      FROM property_items
      GROUP BY property_id
    ) i ON i.property_id = p.id
    LEFT JOIN (
      SELECT
        property_id,
        COUNT(*)::int AS booking_count,
        COALESCE(SUM(gross_cents), 0)::int AS gross_revenue_cents,
        COALESCE(SUM(net_cents), 0)::int AS net_revenue_cents
      FROM bookings
      GROUP BY property_id
    ) b ON b.property_id = p.id
    ORDER BY p.created_at ASC
  `;
  return rows.map((r) => ({
    property: rowToProperty(r.property),
    itemCount: Number(r.item_count) || 0,
    itemsHave: Number(r.items_have) || 0,
    totalBudgetCents: Number(r.total_budget_cents) || 0,
    totalSpentCents: Number(r.total_spent_cents) || 0,
    bookingCount: Number(r.booking_count) || 0,
    grossRevenueCents: Number(r.gross_revenue_cents) || 0,
    netRevenueCents: Number(r.net_revenue_cents) || 0,
  }));
}

// ─── Utilities ───────────────────────────────────────────────
// Re-exported from money.ts so existing server-side imports keep working.
// Client Components should import directly from "@/lib/money" to avoid
// dragging postgres into the browser bundle.
export { dollarsToCents, centsToDollars } from "./money";
