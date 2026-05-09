"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addItem } from "../actions";

type Props = {
  propertyId: string;
  startOrder: number;
};

export function NewCategoryClient({ propertyId, startOrder }: Props) {
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const cat = category.trim();
    const it = item.trim();
    if (!cat || !it) return;
    startTransition(async () => {
      await addItem({
        propertyId,
        category: cat,
        item: it,
        qty: 1,
        notes: "",
        sortOrder: startOrder,
      });
      setCategory("");
      setItem("");
    });
  };

  return (
    <div className="mt-3 grid sm:grid-cols-[1fr_1fr_auto] gap-2">
      <input
        placeholder="Category name (e.g. Outdoor)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
      />
      <input
        placeholder="First item (e.g. Patio chairs)"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !category.trim() || !item.trim()}
        className="btn-gold inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-40"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Add Category
      </button>
    </div>
  );
}
