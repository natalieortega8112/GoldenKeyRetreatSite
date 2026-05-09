"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addItem } from "../actions";

type Props = {
  propertyId: string;
  category: string;
  nextSortOrder: number;
};

export function AddItemRow({ propertyId, category, nextSortOrder }: Props) {
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const qtyNum = Math.max(0, Math.trunc(Number(qty) || 1));
    startTransition(async () => {
      await addItem({
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
      <td className="px-2 py-2 align-middle text-center w-10">
        <Plus className="w-3.5 h-3.5 text-muted mx-auto" />
      </td>
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
      </td>
      <td className="px-2 py-2 align-middle w-20">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-16 bg-white border border-line rounded px-2 py-1 text-sm text-ink text-center focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
      </td>
      <td className="px-2 py-2 align-middle">
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
          className="w-full bg-white border border-line rounded px-2 py-1 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
        />
      </td>
      <td className="px-2 py-2 align-middle w-16 text-right">
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
