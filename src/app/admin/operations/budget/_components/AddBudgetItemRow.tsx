"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addBudgetItem } from "../actions";

type Props = {
  propertyId: string;
  category: string;
  nextSortOrder: number;
};

export function AddBudgetItemRow({
  propertyId,
  category,
  nextSortOrder,
}: Props) {
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const qtyNum = Math.max(0, Math.trunc(Number(qty) || 1));
    startTransition(async () => {
      await addBudgetItem({
        propertyId,
        category,
        item: trimmed,
        qty: qtyNum,
        notes: notes.trim(),
        sortOrder: nextSortOrder,
      });
      setItem("");
      setQty("1");
      setNotes("");
    });
  };

  return (
    <tr className="border-t border-line/60 bg-cream-soft/30">
      <td className="px-2 py-2 align-middle">
        <input
          placeholder="Add item…"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          className="w-full bg-white border border-line rounded px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
        <input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          className="block w-full bg-white border border-line rounded px-2 py-1 mt-1 text-[11px] italic text-charcoal/70 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold placeholder:not-italic"
        />
      </td>
      <td className="px-2 py-2 align-middle w-16">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-12 bg-white border border-line rounded px-2 py-1 text-sm text-ink text-center mx-auto block focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
      </td>
      {/* Price/Unit, Total, Store, Status placeholders */}
      <td className="px-2 py-2 align-middle w-24 text-muted text-xs text-center">—</td>
      <td className="px-2 py-2 align-middle w-24 text-muted text-xs text-right">—</td>
      <td className="px-2 py-2 align-middle text-muted text-xs">—</td>
      <td className="px-2 py-2 align-middle w-32 text-muted text-xs text-center">Pending</td>
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
