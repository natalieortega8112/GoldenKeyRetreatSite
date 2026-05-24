"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { centsToDollars } from "@/lib/money";
import {
  moveBudgetItemToCategory,
  renameCategoryAction,
  setCategoryBudgetAction,
  reorderCategoryAction,
} from "../actions";

type Props = {
  propertyId: string;
  category: string;
  budgetCents: number | null;
  spentCents: number;
  bought: number;
  total: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode; // table body — passed in from the page
};

/**
 * Wraps a category section: handles drop-target for rows, inline rename of
 * the category, per-section budget editing, up/down reorder, and renders
 * the spent / budget / bought header line + progress bar.
 */
export function CategorySection({
  propertyId,
  category,
  budgetCents,
  spentCents,
  bought,
  total,
  canMoveUp,
  canMoveDown,
  children,
}: Props) {
  const [hovering, setHovering] = useState(false);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(category);
  const [budget, setBudget] = useState(centsToDollars(budgetCents));
  const [error, setError] = useState<string | null>(null);

  // Bar prefers % of budget when budget is set; falls back to % bought.
  const pctOfBudget =
    budgetCents != null && budgetCents > 0
      ? (spentCents / budgetCents) * 100
      : null;
  const pctBought = total > 0 ? (bought / total) * 100 : 0;
  const barPct = pctOfBudget != null ? pctOfBudget : pctBought;
  const barOver = pctOfBudget != null && pctOfBudget > 100;

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (e.dataTransfer.types.includes("application/x-budget-row")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!hovering) setHovering(true);
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
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

  const saveName = () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setName(category);
      return;
    }
    if (trimmed === category) return;
    startTransition(async () => {
      const result = await renameCategoryAction(propertyId, category, trimmed);
      if (!result.ok) {
        setError(result.reason ?? "Rename failed");
        setName(category);
      }
    });
  };

  const saveBudget = () => {
    if (budget === centsToDollars(budgetCents)) return;
    startTransition(async () => {
      await setCategoryBudgetAction(propertyId, category, budget || null);
    });
  };

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      await reorderCategoryAction(propertyId, category, direction);
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
      <header className="px-4 py-3 bg-gold/5 border-b border-line">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Reorder arrows */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => move("up")}
              disabled={!canMoveUp || pending}
              aria-label="Move section up"
              className="p-0.5 text-muted hover:text-gold-deep disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move("down")}
              disabled={!canMoveDown || pending}
              aria-label="Move section down"
              className="p-0.5 text-muted hover:text-gold-deep disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Editable name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
            className="font-serif text-base text-ink bg-transparent border-none px-1 py-0.5 rounded hover:bg-white focus:bg-white focus:ring-1 focus:ring-gold/40 focus:outline-none min-w-0 max-w-[200px]"
          />

          {/* Spent · bought summary */}
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
            {fmt(spentCents)}
            {budgetCents != null && budgetCents > 0 ? (
              <>
                {" / "}
                {fmt(budgetCents)}
              </>
            ) : null}
            {" · "}
            {bought}/{total} bought
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Budget editor */}
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-muted">
              Budget
              <div className="relative">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
                  $
                </span>
                <input
                  inputMode="decimal"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onBlur={saveBudget}
                  placeholder="—"
                  className="w-20 bg-white border border-line rounded pl-5 pr-1 py-1 text-sm text-ink text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold"
                />
              </div>
            </label>

            {/* Progress bar */}
            <div className="w-32 sm:w-48 shrink-0">
              <div className="h-1.5 bg-cream-soft rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    barOver ? "bg-red-400" : "bg-gold"
                  }`}
                  style={{
                    width: Math.min(100, Math.max(0, barPct)) + "%",
                  }}
                />
              </div>
              <div className="text-[10px] text-right text-muted mt-0.5">
                {pctOfBudget != null
                  ? `${pctOfBudget.toFixed(0)}% of budget`
                  : `${pctBought.toFixed(0)}% bought`}
              </div>
            </div>

            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-deep" />}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
            {error}
          </div>
        )}
      </header>
      {children}
    </section>
  );
}

function fmt(cents: number): string {
  return (
    "$" +
    Math.round(cents / 100).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  );
}
