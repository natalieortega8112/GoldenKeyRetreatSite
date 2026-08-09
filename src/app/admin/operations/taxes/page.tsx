import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Trash2, FolderOpen } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  listTaxDocuments,
  listTaxYears,
  listProperties,
  getExpenseSummaryForYear,
  getRevenueSummaryForYear,
  TAX_DOCUMENT_CATEGORIES,
} from "@/lib/operations";
import type { TaxDocument } from "@/lib/operations";
import { proxiedBlobUrl } from "@/lib/blob-url";
import { deleteTaxDocumentAction, uploadTaxDocumentAction } from "./actions";
import { UploadForm } from "./_form/UploadForm";

export const revalidate = 0;
export const metadata = { title: "Taxes | Admin · Golden Key Retreats" };

export default async function TaxesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbReady = isDbConfigured();

  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const activeYear = Number(sp.year) || currentYear;

  const [years, docsForYear, properties, expenseSummary, revenue] = dbReady
    ? await Promise.all([
        listTaxYears().catch(() => [currentYear]),
        listTaxDocuments(activeYear).catch(() => []),
        listProperties().catch(() => []),
        getExpenseSummaryForYear(activeYear).catch(() => []),
        getRevenueSummaryForYear(activeYear).catch(() => ({
          grossCents: 0,
          netCents: 0,
          bookings: 0,
        })),
      ])
    : [
        [currentYear],
        [] as TaxDocument[],
        [],
        [],
        { grossCents: 0, netCents: 0, bookings: 0 },
      ];

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const totalExpensesCents = expenseSummary.reduce(
    (s, r) => s + r.totalCents,
    0,
  );
  const estimatedProfit = revenue.netCents - totalExpensesCents;

  // Group docs by category for display
  const byCategory = new Map<string, TaxDocument[]>();
  for (const d of docsForYear) {
    const list = byCategory.get(d.category) ?? [];
    list.push(d);
    byCategory.set(d.category, list);
  }
  const orderedCategories = [
    ...TAX_DOCUMENT_CATEGORIES.filter((c) => byCategory.has(c)),
    ...Array.from(byCategory.keys()).filter(
      (c) => !TAX_DOCUMENT_CATEGORIES.includes(
        c as (typeof TAX_DOCUMENT_CATEGORIES)[number],
      ),
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold-deep mb-1">
          Operations · Taxes
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">
          Tax Folder
        </h1>
        <p className="text-sm text-charcoal/70 mt-1">
          Upload receipts, 1099s, mortgage statements, and quarterly estimates.
          The Schedule-C-style summary below is pulled live from your logged
          expenses and bookings.
        </p>
      </div>

      {!dbReady && (
        <div className="rounded-md bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 mb-6 text-sm">
          <strong>Database not connected.</strong> Set <code>POSTGRES_URL</code>.
        </div>
      )}

      {/* Year tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {years.map((y) => {
          const active = y === activeYear;
          return (
            <Link
              key={y}
              href={`/admin/operations/taxes?year=${y}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors ${
                active
                  ? "bg-gold text-white ring-gold"
                  : "bg-white text-charcoal ring-line hover:ring-gold/60"
              }`}
            >
              {y}
              {y === currentYear && (
                <span
                  className={`ml-1.5 text-[10px] uppercase tracking-wider ${
                    active ? "text-white/80" : "text-muted"
                  }`}
                >
                  current
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Year-at-a-glance stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Stat
          label={`${activeYear} Gross Revenue`}
          value={fmt(revenue.grossCents)}
          sub={`${revenue.bookings} ${revenue.bookings === 1 ? "booking" : "bookings"}`}
        />
        <Stat
          label={`${activeYear} Net Revenue`}
          value={fmt(revenue.netCents)}
          sub="after platform + cleaning"
        />
        <Stat
          label={`${activeYear} Expenses`}
          value={fmt(totalExpensesCents)}
          sub={`${expenseSummary.length} categories`}
        />
        <Stat
          label={`${activeYear} Est. Profit`}
          value={fmt(estimatedProfit)}
          sub="net revenue − expenses"
          accent
        />
      </div>

      {/* Schedule-C-style expense breakdown */}
      <section className="bg-white rounded-xl ring-1 ring-line overflow-hidden mb-8">
        <header className="flex items-center justify-between px-5 py-3 bg-gold/5 border-b border-line">
          <h2 className="font-serif text-base text-ink">
            {activeYear} Expense Breakdown
          </h2>
          <Link
            href="/admin/operations/expenses"
            className="text-xs text-gold-deep hover:text-ink inline-flex items-center gap-1"
          >
            Manage <ExternalLink className="w-3 h-3" />
          </Link>
        </header>
        {expenseSummary.length === 0 ? (
          <div className="p-6 text-sm text-charcoal/70">
            No expenses logged for {activeYear} yet.{" "}
            <Link
              href="/admin/operations/expenses/new"
              className="text-gold-deep hover:underline"
            >
              Log the first one →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {expenseSummary.map((row) => {
              const pct =
                totalExpensesCents > 0
                  ? Math.round((row.totalCents / totalExpensesCents) * 100)
                  : 0;
              return (
                <div
                  key={row.category}
                  className="px-5 py-3 flex items-center gap-4 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-ink font-medium">{row.category}</div>
                    <div className="text-[11px] text-muted">
                      {row.count} {row.count === 1 ? "expense" : "expenses"}
                    </div>
                  </div>
                  <div className="w-32 sm:w-48">
                    <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right tabular-nums font-medium text-ink">
                    {fmt(row.totalCents)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upload */}
      <h2 className="font-serif text-lg text-ink mb-3">Upload a Document</h2>
      <div className="mb-8">
        <UploadForm
          defaultYear={activeYear}
          years={years}
          properties={properties}
          action={uploadTaxDocumentAction}
        />
      </div>

      {/* Documents */}
      <h2 className="font-serif text-lg text-ink mb-3">
        {activeYear} Documents
        <span className="text-sm text-muted font-sans ml-2">
          ({docsForYear.length})
        </span>
      </h2>
      {docsForYear.length === 0 ? (
        <div className="rounded-xl bg-white ring-1 ring-line p-10 text-center">
          <FolderOpen className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-sm text-charcoal/70">
            Nothing here yet for {activeYear}. Upload your first document above.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedCategories.map((cat) => {
            const docs = byCategory.get(cat) ?? [];
            return (
              <section
                key={cat}
                className="bg-white rounded-xl ring-1 ring-line overflow-hidden"
              >
                <header className="px-5 py-2.5 bg-gold/5 border-b border-line">
                  <h3 className="font-serif text-sm text-ink">{cat}</h3>
                </header>
                <div className="divide-y divide-line">
                  {docs.map((d) => {
                    const prop = d.propertyId
                      ? propertyMap.get(d.propertyId)
                      : null;
                    return (
                      <div
                        key={d.id}
                        className="px-5 py-3 flex items-center gap-4 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-ink font-medium truncate">
                            {d.name}
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            {d.fileName}
                            {prop && (
                              <>
                                {" · "}
                                <span className="text-gold-deep">
                                  {prop.name}
                                </span>
                              </>
                            )}
                            {" · "}
                            {formatSize(d.fileSize)}
                            {" · "}
                            {new Date(d.uploadedAt).toLocaleDateString()}
                          </div>
                          {d.notes && (
                            <div className="text-[11px] text-charcoal/60 mt-0.5 truncate">
                              {d.notes}
                            </div>
                          )}
                        </div>
                        <a
                          href={proxiedBlobUrl(d.fileUrl) ?? d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                        <form
                          action={async () => {
                            "use server";
                            await deleteTaxDocumentAction(d.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-red-600 hover:bg-red-50 border border-red-200"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-line ${
        accent ? "bg-gold/5" : "bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold-deep mb-1.5">
        {label}
      </div>
      <div
        className={`font-serif text-2xl ${
          accent ? "text-gold-deep" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

function fmt(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  return (
    sign +
    "$" +
    Math.round(Math.abs(cents) / 100).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
