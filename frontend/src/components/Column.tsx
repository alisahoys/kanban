"use client";

import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column as ColumnType } from "@/lib/board";
import { AddCardForm } from "./AddCardForm";
import { SortableCard } from "./Card";

type ColumnProps = {
  column: ColumnType;
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export function Column({ column, onRename, onAddCard, onDeleteCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [draft, setDraft] = useState<string | null>(null);
  const cancelNextBlur = useRef(false);

  const commit = () => {
    if (cancelNextBlur.current) {
      cancelNextBlur.current = false;
      setDraft(null);
      return;
    }

    const next = (draft ?? column.title).trim();
    if (next && next !== column.title) onRename(column.id, next);
    setDraft(null);
  };

  return (
    <section
      aria-label={column.title}
      className={`flex min-w-[260px] max-w-[320px] flex-1 flex-col rounded-[22px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(243,221,227,0.5))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-200 sm:min-w-[245px] ${
        isOver ? "border-accent bg-blush/80 shadow-[0_16px_24px_rgba(199,125,150,0.18)]" : "border-rose/35"
      }`}
    >
      <header className="flex items-center gap-2 border-b border-line/80 px-4 pb-3 pt-4">
        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent ring-4 ring-rose/25" />
        <input
          value={draft ?? column.title}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              event.preventDefault();
              cancelNextBlur.current = true;
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          aria-label={`Rename column ${column.title}`}
          title="Select to rename this stage"
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm font-semibold tracking-[0.08em] text-ink outline-none transition hover:bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-accent/30"
        />
        <span aria-label={`${column.cards.length} cards`} className="rounded-full border border-rose/30 bg-white/70 px-2 py-0.5 text-[11px] font-bold tracking-wide text-accent">
          {column.cards.length}
        </span>
      </header>

      <div ref={setNodeRef} className="flex min-h-[72px] flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 pt-3">
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <div className="flex min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-rose/60 bg-white/40 px-4 text-center">
            <p className="text-xs font-medium leading-relaxed text-muted">Drop a card here or add one below</p>
          </div>
        )}
      </div>

      <div className="border-t border-line/80 px-3 pb-3 pt-3">
        <AddCardForm onAdd={(title, details) => onAddCard(column.id, title, details)} />
      </div>
    </section>
  );
}
