"use client";

import { useState, useTransition } from "react";
import { moveBudgetItemToCategory } from "../actions";

type Props = {
  category: string;
  children: React.ReactNode;
};

/**
 * Wraps a category section so the whole thing accepts a dropped BudgetRow.
 * Reads the dragged row's id from dataTransfer and calls the move action.
 * Shows a gold dashed border + soft fill while a row is hovering over it.
 */
export function CategorySection({ category, children }: Props) {
  const [hovering, setHovering] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    // Only react to row drags (not random page drags).
    if (e.dataTransfer.types.includes("application/x-budget-row")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!hovering) setHovering(true);
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    // Only clear when the cursor truly leaves the section (not when entering
    // a child element). currentTarget vs relatedTarget check.
    const next = e.relatedTarget as Node | null;
    if (!next || !(e.currentTarget as Node).contains(next)) {
      setHovering(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setHovering(false);
    const id = e.dataTransfer.getData("application/x-budget-row");
    if (!id) return;
    startTransition(async () => {
      await moveBudgetItemToCategory(id, category);
    });
  };

  return (
    <section
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`bg-white rounded-xl ring-1 overflow-hidden transition-all ${
        hovering
          ? "ring-2 ring-gold ring-offset-2 ring-offset-cream bg-gold/5"
          : "ring-line"
      } ${pending ? "opacity-80" : ""}`}
      data-category={category}
    >
      {children}
    </section>
  );
}
