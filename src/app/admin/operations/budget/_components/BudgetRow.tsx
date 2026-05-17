"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Trash2 } from "lucide-react";
import type { PropertyItem, PropertyItemStatus } from "@/lib/operations";
import { centsToDollars } from "@/lib/money";
import { updateBudgetField, removeBudgetItem } from "../actions";

const STATUSES: PropertyItemStatus[] = ["Pending", "Ordered", "Bought"];

const STATUS_STYLE: Record<PropertyItemStatus, string> = {
  Pending: "bg-gold/15 text-gold-deep ring-1 ring-gold/40",
  Ordered: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  Bought: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
};

export function BudgetRow({ item }: { item: PropertyItem }) {
  const [price, setPrice] = useState(centsToDollars(item.actualCostCents));
  const [store, setStore] = useState(item.store);
  const [status, setStatus] = useState<PropertyItemStatus>(item.status);
  const [qty, setQty] = useState(item.qty.toString());
  const [notes, setNotes] = useState(item.notes);
  const [itemName, setItemName] = useState(item.item);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 800);
  };

  const savePrice = () => {
    if (price === centsToDollars(item.actualCostCents)) return;
    startTransition(async () => {
      await updateBudgetField(item.id, { priceDollars: price });
      flashSaved();
    });
  };
  const saveStore = () => {
    if (store === item.store) return;
    startTransition(async () => {
      await updateBudgetField(item.id, { store });
      flashSaved();
    });
  };
  const saveStatus = (next: PropertyItemStatus) => {
    setStatus(next);
    startTransition(async () => {
      await updateBudgetField(item.id, { status: next });
      flashSaved();
    });
  };
  const saveQty = () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n === item.qty) return;
    startTransition(async () => {
      await updateBudgetField(item.id, { qty: Math.max(0, Math.trunc(n)) });
      flashSaved();
    });
  };
  const saveNotes = () => {
    if (notes === item.notes) return;
    startTransition(async () => {
      await updateBudgetField(item.id, { notes });
      flashSaved();
    });
  };
  const saveItemName = () => {
    const trimmed = itemName.trim();
    if (!trimmed || trimmed === item.item) {
      if (!trimmed) setItemName(item.item); // revert if cleared
      return;
    }
    startTransition(async () => {
      await updateBudgetField(item.id, { item: trimmed });
      flashSaved();
    });
  };
  const onDelete = () => {
    if (!confirm(`Delete "${item.item}"?`)) return;
    startTransition(async () => {
      await removeBudgetItem(item.id);
    });
  };

  const qtyN = Number(qty);
  const qtyEff = Number.isFinite(qtyN) && qty !== "" ? qtyN : item.qty;
  const priceN = Number(price);
  const totalCost =
    Number.isFinite(priceN) && price !== "" ? qtyEff * priceN : null;

  return (
    <tr className="border-t border-line/60 hover:bg-cream-soft/40">
      <td className="px-2 py-2 align-middle">
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          onBlur={saveItemName}
          className="block w-full bg-transparent border-none px-1 py-0.5 rounded text-sm text-ink hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="add note…"
          className="block w-full bg-transparent border-none px-1 py-0.5 mt-0.5 rounded text-[11px] italic text-charcoal/60 hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none placeholder:not-italic placeholder:text-line"
        />
      </td>
      <td className="px-2 py-2 align-middle w-16">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={saveQty}
          className="w-12 bg-transparent border-none px-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-ink text-center mx-auto block"
        />
      </td>
      <td className="px-2 py-2 align-middle w-24">
        <DollarInput
          value={price}
          onChange={setPrice}
          onBlur={savePrice}
          placeholder="—"
        />
      </td>
      <td className="px-2 py-2 align-middle w-24 text-right text-sm text-charcoal/80 tabular-nums">
        {totalCost != null ? "$" + totalCost.toFixed(2) : "—"}
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          value={store}
          onChange={(e) => setStore(e.target.value)}
          onBlur={saveStore}
          placeholder="—"
          className="w-full bg-transparent border-none px-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-charcoal"
        />
      </td>
      <td className="px-2 py-2 align-middle w-32">
        <select
          value={status}
          onChange={(e) => saveStatus(e.target.value as PropertyItemStatus)}
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
        <div className="inline-flex items-center justify-end gap-1.5">
          {pending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-deep" />
          ) : savedFlash ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete row"
              className="p-1 rounded text-muted hover:text-red-600 hover:bg-red-50"
              disabled={pending}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function DollarInput({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
        $
      </span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full bg-transparent border-none pl-5 pr-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-ink text-right tabular-nums"
      />
    </div>
  );
}
