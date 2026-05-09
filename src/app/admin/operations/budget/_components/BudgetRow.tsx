"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import type { PropertyItem, PropertyItemStatus } from "@/lib/operations";
import { centsToDollars } from "@/lib/operations";
import { updateBudgetField } from "../actions";

const STATUSES: PropertyItemStatus[] = ["Pending", "Ordered", "Bought"];

const STATUS_STYLE: Record<PropertyItemStatus, string> = {
  Pending: "bg-gold/15 text-gold-deep ring-1 ring-gold/40",
  Ordered: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  Bought: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
};

export function BudgetRow({ item }: { item: PropertyItem }) {
  const [budget, setBudget] = useState(centsToDollars(item.budgetCents));
  const [price, setPrice] = useState(centsToDollars(item.actualCostCents));
  const [store, setStore] = useState(item.store);
  const [status, setStatus] = useState<PropertyItemStatus>(item.status);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 800);
  };

  const saveBudget = () => {
    if (budget === centsToDollars(item.budgetCents)) return;
    startTransition(async () => {
      await updateBudgetField(item.id, { budgetDollars: budget });
      flashSaved();
    });
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

  const qtyN = item.qty;
  const priceN = Number(price);
  const totalCost =
    Number.isFinite(priceN) && price !== "" ? qtyN * priceN : null;

  return (
    <tr className="border-t border-line/60 hover:bg-cream-soft/40">
      <td className="px-2 py-2 align-middle">
        <span className="text-sm text-ink">{item.item}</span>
        {item.notes && (
          <div className="text-[11px] italic text-charcoal/60 mt-0.5">
            {item.notes}
          </div>
        )}
      </td>
      <td className="px-2 py-2 align-middle text-center text-sm text-muted w-12">
        {item.qty}
      </td>
      <td className="px-2 py-2 align-middle w-24">
        <DollarInput
          value={budget}
          onChange={setBudget}
          onBlur={saveBudget}
          placeholder="—"
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
      <td className="px-2 py-2 align-middle w-8 text-right">
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-deep inline" />
        ) : savedFlash ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
        ) : null}
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
