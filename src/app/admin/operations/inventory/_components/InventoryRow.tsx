"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, Check } from "lucide-react";
import type { PropertyItem } from "@/lib/operations";
import { removeItem, toggleItemHas, updateItemField } from "../actions";

type Props = { item: PropertyItem };

export function InventoryRow({ item }: Props) {
  const [hasIt, setHasIt] = useState(item.hasIt);
  const [qty, setQty] = useState(item.qty.toString());
  const [name, setName] = useState(item.item);
  const [notes, setNotes] = useState(item.notes);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 900);
  };

  const onToggle = () => {
    const next = !hasIt;
    setHasIt(next); // optimistic
    startTransition(async () => {
      await toggleItemHas(item.id, next);
      flashSaved();
    });
  };

  const saveQty = () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n === item.qty) return;
    startTransition(async () => {
      await updateItemField(item.id, { qty: Math.max(0, Math.trunc(n)) });
      flashSaved();
    });
  };

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === item.item) return;
    startTransition(async () => {
      await updateItemField(item.id, { item: trimmed });
      flashSaved();
    });
  };

  const saveNotes = () => {
    if (notes === item.notes) return;
    startTransition(async () => {
      await updateItemField(item.id, { notes });
      flashSaved();
    });
  };

  const onDelete = () => {
    if (!confirm(`Delete "${item.item}"?`)) return;
    startTransition(async () => {
      await removeItem(item.id);
    });
  };

  return (
    <tr className="border-t border-line/60 hover:bg-cream-soft/40">
      <td className="px-2 py-2 align-middle text-center w-10">
        <button
          type="button"
          onClick={onToggle}
          className={`w-5 h-5 rounded border transition-all inline-flex items-center justify-center ${
            hasIt
              ? "bg-gold border-gold"
              : "bg-white border-line hover:border-gold-deep"
          }`}
          aria-pressed={hasIt}
          aria-label="Have it"
          disabled={pending}
        >
          {hasIt && <Check className="w-3.5 h-3.5 text-white" />}
        </button>
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="w-full bg-transparent border-none px-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-ink"
        />
      </td>
      <td className="px-2 py-2 align-middle w-20">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={saveQty}
          className="w-16 bg-transparent border-none px-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-ink text-center"
        />
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="—"
          className="w-full bg-transparent border-none px-1 py-1 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none text-sm text-charcoal/80 italic placeholder:not-italic placeholder:text-line"
        />
      </td>
      <td className="px-2 py-2 align-middle w-16 text-right">
        <div className="flex items-center justify-end gap-1.5">
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
