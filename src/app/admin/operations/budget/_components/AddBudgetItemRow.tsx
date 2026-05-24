"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { PropertyItemStatus } from "@/lib/operations";
import { addBudgetItem } from "../actions";

type Props = {
  propertyId: string;
  category: string;
  nextSortOrder: number;
};

const STATUSES: PropertyItemStatus[] = ["Pending", "Ordered", "Bought"];

const STATUS_STYLE: Record<PropertyItemStatus, string> = {
  Pending: "bg-gold/15 text-gold-deep ring-1 ring-gold/40",
  Ordered: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  Bought: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
};

export function AddBudgetItemRow({
  propertyId,
  category,
  nextSortOrder,
}: Props) {
  const [item, setItem] = useState("");
  const [notes, setNotes] = useState("");
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
    if (!trimmed) return;
    const qtyNum = Math.max(0, Math.trunc(qtyN || 1));
    startTransition(async () => {
      await addBudgetItem({
        propertyId,
        category,
        item: trimmed,
        qty: qtyNum,
        notes: notes.trim(),
        sortOrder: nextSortOrder,
        priceDollars: price === "" ? null : price,
        store: store.trim(),
        status,
      });
      // Reset
      setItem("");
      setNotes("");
      setQty("1");
      setPrice("");
      setStore("");
      setStatus("Pending");
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <tr className="border-t border-line/60 bg-cream-soft/30">
      <td className="px-2 py-2 align-middle">
        <input
          placeholder="Add item…"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={onKey}
          className="w-full bg-white border border-line rounded px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
        <input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={onKey}
          className="block w-full bg-white border border-line rounded px-2 py-1 mt-1 text-[11px] italic text-charcoal/70 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:not-italic"
        />
      </td>
      <td className="px-2 py-2 align-middle w-16">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={onKey}
          className="w-12 bg-white border border-line rounded px-2 py-1 text-sm text-ink text-center mx-auto block focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
      </td>
      <td className="px-2 py-2 align-middle w-24">
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
            className="w-full bg-white border border-line rounded pl-5 pr-1 py-1 text-sm text-ink text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:text-line"
          />
        </div>
      </td>
      <td className="px-2 py-2 align-middle w-24 text-right text-sm text-charcoal/80 tabular-nums">
        {total != null ? "$" + total.toFixed(2) : "—"}
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          placeholder="Store"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          onKeyDown={onKey}
          className="w-full bg-white border border-line rounded px-2 py-1 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:text-line"
        />
      </td>
      <td className="px-2 py-2 align-middle w-32">
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
      </td>
      <td className="px-2 py-2 align-middle w-12 text-right">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !item.trim()}
          className="btn-gold inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          Add
        </button>
      </td>
    </tr>
  );
}
