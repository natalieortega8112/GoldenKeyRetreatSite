// Backup helpers: build an .xlsx snapshot of the operations data and (optionally)
// upload it to Vercel Blob.
import ExcelJS from "exceljs";
import { put, list, del, type ListBlobResultBlob } from "@vercel/blob";
import {
  listProperties,
  listPropertyItems,
  listBookings,
  listExpenses,
  listTaxDocuments,
  centsToDollars,
} from "./operations";

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFC9A24B" },
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

function styleHeader(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
}

export async function buildOperationsWorkbook(): Promise<Buffer> {
  const [properties, items, bookings, expenses, taxDocs] = await Promise.all([
    listProperties(),
    listPropertyItems(),
    listBookings(),
    listExpenses(),
    listTaxDocuments(),
  ]);
  const propertyName = (id: string | null) =>
    id ? (properties.find((p) => p.id === id)?.name ?? id) : "LLC / Business-wide";

  const wb = new ExcelJS.Workbook();
  wb.creator = "Golden Key Retreats — Operations Sheet";
  wb.created = new Date();

  // ── Properties sheet ──
  const propSheet = wb.addWorksheet("Properties");
  propSheet.columns = [
    { header: "ID", key: "id", width: 16 },
    { header: "Name", key: "name", width: 26 },
    { header: "Address", key: "address", width: 40 },
    { header: "Monthly Rent ($)", key: "rent", width: 18 },
    { header: "Beds", key: "beds", width: 8 },
    { header: "Baths", key: "baths", width: 8 },
    { header: "Amenities", key: "amenities", width: 50 },
    { header: "Created", key: "createdAt", width: 22 },
  ];
  styleHeader(propSheet.getRow(1));
  for (const p of properties) {
    propSheet.addRow({
      id: p.id,
      name: p.name,
      address: p.address,
      rent: p.monthlyRentCents != null ? p.monthlyRentCents / 100 : null,
      beds: p.beds,
      baths: p.baths,
      amenities: p.amenities.join(", "),
      createdAt: p.createdAt,
    });
  }
  propSheet.getColumn("rent").numFmt = '"$"#,##0.00';

  // ── Inventory + Budget combined sheet ──
  const itemSheet = wb.addWorksheet("Inventory & Budget");
  itemSheet.columns = [
    { header: "Property", key: "property", width: 22 },
    { header: "Category", key: "category", width: 22 },
    { header: "Item", key: "item", width: 30 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Notes", key: "notes", width: 22 },
    { header: "Have", key: "has", width: 8 },
    { header: "Status", key: "status", width: 12 },
    { header: "Budget ($)", key: "budget", width: 12 },
    { header: "Price/Unit ($)", key: "price", width: 14 },
    { header: "Total Cost ($)", key: "total", width: 14 },
    { header: "Store", key: "store", width: 18 },
  ];
  styleHeader(itemSheet.getRow(1));
  for (const it of items) {
    const total =
      it.actualCostCents != null ? (it.actualCostCents * it.qty) / 100 : null;
    itemSheet.addRow({
      property: propertyName(it.propertyId),
      category: it.category,
      item: it.item,
      qty: it.qty,
      notes: it.notes,
      has: it.hasIt ? "✓" : "",
      status: it.status,
      budget: it.budgetCents != null ? it.budgetCents / 100 : null,
      price: it.actualCostCents != null ? it.actualCostCents / 100 : null,
      total,
      store: it.store,
    });
  }
  ["budget", "price", "total"].forEach((k) => {
    itemSheet.getColumn(k).numFmt = '"$"#,##0.00';
  });

  // ── Bookings sheet ──
  const bookSheet = wb.addWorksheet("Bookings");
  bookSheet.columns = [
    { header: "Property", key: "property", width: 22 },
    { header: "Source", key: "source", width: 14 },
    { header: "Check-in", key: "checkIn", width: 14 },
    { header: "Check-out", key: "checkOut", width: 14 },
    { header: "Nights", key: "nights", width: 9 },
    { header: "Gross ($)", key: "gross", width: 12 },
    { header: "Cleaning ($)", key: "cleaning", width: 12 },
    { header: "Platform Fee ($)", key: "platform", width: 14 },
    { header: "Net ($)", key: "net", width: 12 },
    { header: "Notes", key: "notes", width: 28 },
  ];
  styleHeader(bookSheet.getRow(1));
  for (const b of bookings) {
    bookSheet.addRow({
      property: propertyName(b.propertyId),
      source: b.source,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,
      gross: b.grossCents / 100,
      cleaning: b.cleaningCents / 100,
      platform: b.platformFeeCents / 100,
      net: b.netCents / 100,
      notes: b.notes,
    });
  }
  ["gross", "cleaning", "platform", "net"].forEach((k) => {
    bookSheet.getColumn(k).numFmt = '"$"#,##0.00';
  });

  // ── Expenses sheet ──
  const expSheet = wb.addWorksheet("Expenses");
  expSheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Category", key: "category", width: 22 },
    { header: "Property", key: "property", width: 22 },
    { header: "Vendor", key: "vendor", width: 20 },
    { header: "Description", key: "description", width: 30 },
    { header: "Amount ($)", key: "amount", width: 12 },
    { header: "Receipt", key: "receipt", width: 40 },
    { header: "Notes", key: "notes", width: 28 },
  ];
  styleHeader(expSheet.getRow(1));
  for (const e of expenses) {
    expSheet.addRow({
      date: e.spentOn,
      category: e.category,
      property: propertyName(e.propertyId),
      vendor: e.vendor,
      description: e.description,
      amount: e.amountCents / 100,
      receipt: e.receiptUrl ?? "",
      notes: e.notes,
    });
  }
  expSheet.getColumn("amount").numFmt = '"$"#,##0.00';

  // ── Tax Documents sheet ──
  const taxSheet = wb.addWorksheet("Tax Documents");
  taxSheet.columns = [
    { header: "Tax Year", key: "year", width: 10 },
    { header: "Category", key: "category", width: 24 },
    { header: "Name", key: "name", width: 30 },
    { header: "Property", key: "property", width: 22 },
    { header: "File", key: "fileName", width: 30 },
    { header: "Size (KB)", key: "size", width: 12 },
    { header: "URL", key: "url", width: 50 },
    { header: "Uploaded", key: "uploaded", width: 20 },
    { header: "Notes", key: "notes", width: 28 },
  ];
  styleHeader(taxSheet.getRow(1));
  for (const d of taxDocs) {
    taxSheet.addRow({
      year: d.taxYear,
      category: d.category,
      name: d.name,
      property: propertyName(d.propertyId),
      fileName: d.fileName,
      size: d.fileSize > 0 ? Math.round(d.fileSize / 1024) : "",
      url: d.fileUrl,
      uploaded: new Date(d.uploadedAt).toLocaleString(),
      notes: d.notes,
    });
  }

  // ── Metadata sheet (snapshot context) ──
  const metaSheet = wb.addWorksheet("_meta");
  metaSheet.columns = [
    { header: "Key", key: "key", width: 24 },
    { header: "Value", key: "value", width: 60 },
  ];
  styleHeader(metaSheet.getRow(1));
  metaSheet.addRow({ key: "Snapshot taken", value: new Date().toISOString() });
  metaSheet.addRow({ key: "Properties", value: properties.length });
  metaSheet.addRow({ key: "Inventory rows", value: items.length });
  metaSheet.addRow({ key: "Bookings", value: bookings.length });
  metaSheet.addRow({ key: "Expenses", value: expenses.length });
  metaSheet.addRow({ key: "Tax documents", value: taxDocs.length });
  metaSheet.addRow({ key: "Source", value: "goldenkeyretreats.org" });

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export type BackupBlob = {
  url: string;
  pathname: string;
  uploadedAt: Date;
  size: number;
};

const BACKUP_PREFIX = "operations-backups/";

export async function uploadBackupSnapshot(
  buffer: Buffer,
): Promise<BackupBlob | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19); // 2025-05-09_12-34-56
  const key = `${BACKUP_PREFIX}operations-${ts}.xlsx`;
  const blob = await put(key, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return {
    url: blob.url,
    pathname: blob.pathname,
    uploadedAt: new Date(),
    size: buffer.length,
  };
}

export async function listBackupSnapshots(): Promise<BackupBlob[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const result = await list({ prefix: BACKUP_PREFIX });
  return (result.blobs as ListBlobResultBlob[])
    .map((b) => ({
      url: b.url,
      pathname: b.pathname,
      uploadedAt: b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt),
      size: b.size,
    }))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/**
 * Delete snapshots older than the `keep` most-recent ones. Used after the
 * nightly cron uploads a new snapshot so Blob storage doesn't grow forever.
 * Returns the number of snapshots deleted.
 */
export async function pruneOldBackups(keep = 30): Promise<number> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return 0;
  const all = await listBackupSnapshots();
  const stale = all.slice(keep);
  if (stale.length === 0) return 0;
  // del() accepts string | string[] — the URL or pathname.
  await del(stale.map((s) => s.url));
  return stale.length;
}

// Used in the meta sheet — silences unused-import warnings if removed.
export { centsToDollars };
