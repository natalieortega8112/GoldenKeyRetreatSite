"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { PropertyItemStatus } from "@/lib/operations";
import { addBudgetItem } from "../actions";

type Props = {
  propertyId: string;
  categories: string[]; // available categories to drop the new row into
  nextSortOrderByCategory: Record<string, number>; // max sort_order + 1 per category
};

const STATUSES: PropertyItemStatus[] = ["Pending", "Ordered", "Bought"];

const STATUS_STYLE: Record<PropertyItemStatus, string> = {
  Pending: "bg-gold/15 text-gold-deep ring-1 ring-gold/40",
  Ordered: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  Bought: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
};

export function QuickAddItem({
  propertyId,
  categories,
  nextSortOrderByCategory,
}: Props) {
  const [item, setItem] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [status, setStatus] = useState<PropertyItemStatus>("Pending");
  const [pending, startTransition] = useTransition();

  const qtyN = Number(qty);
  const priceN = Number(price);
  const total =
    Number.isFinite(qtyN) && Number.isFinite(priceN) && price !== ""
      ? qtyN * priceN
      : null;

  const submit = () => {
    const trimmed = item.trim();
    if (!trimmed || !category) return;
    const qtyNum = Math.max(0, Math.trunc(qtyN || 1));
    const sortOrder = nextSortOrderByCategory[category] ?? 1;
    startTransition(async () => {
      await addBudgetItem({
        propertyId,
        category,
        item: trimmed,
        qty: qtyNum,
        notes: notes.trim(),
        sortOrder,
        priceDollars: price === "" ? null : price,
        store: store.trim(),
        status,
      });
      setItem("");
      setNotes("");
      setQty("1");
      setPrice("");
      setStore("");
      setStatus("Pending");
      // keep `category` so the user can quickly add multiple to the same section
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="bg-white rounded-xl ring-1 ring-line p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-base text-ink">Quick Add</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Pick a category, fill the row, hit Add
        </span>
      </div>
      <div className="grid grid-cols-12 gap-2 items-start">
        {/* Item + notes — 4 cols */}
        <div className="col-span-12 sm:col-span-4">
          <input
            placeholder="Item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-cream-soft/30 border border-line rounded px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
          />
          <input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={onKey}
            className="block w-full bg-cream-soft/30 border border-line rounded px-2 py-1 mt-1 text-[11px] italic text-charcoal/70 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:not-italic"
          />
        </div>

        {/* Category dropdown */}
        <div className="col-span-6 sm:col-span-2">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-line rounded px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
          >
            {categories.length === 0 && <option value="">No categories</option>}
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Qty */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Qty
          </label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-white border border-line rounded px-2 py-1.5 text-sm text-ink text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
          />
        </div>

        {/* Price/Unit */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
              $
            </span>
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={onKey}
              placeholder="0.00"
              className="w-full bg-white border border-line rounded pl-5 pr-1 py-1.5 text-sm text-ink text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:text-line"
            />
          </div>
        </div>

        {/* Total (computed) */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Total
          </label>
          <div className="px-2 py-1.5 text-sm text-right tabular-nums text-charcoal/80 bg-cream-soft/30 border border-line rounded">
            {total != null ? "$" + total.toFixed(2) : "—"}
          </div>
        </div>

        {/* Store */}
        <div className="col-span-6 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Store
          </label>
          <input
            placeholder="—"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-white border border-line rounded px-2 py-1.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:text-line"
          />
        </div>

        {/* Status */}
        <div className="col-span-6 sm:col-span-1">
          <label className="block text-[9px] uppercase tracking-[0.15em] text-muted mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyItemStatus)}
            className={`w-full text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-full font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-gold/40 ${STATUS_STYLE[status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Add button */}
        <div className="col-span-12 sm:col-span-1 self-end">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !item.trim() || !category}
            className="btn-gold w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            {pending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add
          </button>
        </div>
      </div>
      <p className="text-[11px] text-muted mt-3">
        Lands at the bottom of the selected category. You can drag it elsewhere
        anytime after.
      </p>
    </div>
  );
}
