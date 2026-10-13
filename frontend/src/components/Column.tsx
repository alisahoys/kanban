"use client";

import { useState } from "react";
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

  const commit = () => {
    const next = (draft ?? column.title).trim();
    if (next && next !== column.title) onRename(column.id, next);
    setDraft(null);
  };

  return (
    <section
      aria-label={column.title}
      className={`flex max-h-full w-[300px] shrink-0 flex-col rounded-2xl border bg-blush/50 transition-colors ${
        isOver ? "border-accent bg-blush" : "border-rose/40"
      }`}
    >
      <header className="flex items-center gap-2 px-4 pb-2 pt-4">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-rose/30" />
        <input
          value={draft ?? column.title}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          aria-label={`Rename column ${column.title}`}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm font-semibold tracking-wide text-ink outline-none transition hover:bg-surface/70 focus:bg-surface focus:ring-2 focus:ring-accent/40"
        />
        <span className="rounded-full bg-rose/30 px-2 py-0.5 text-xs font-semibold text-accent">
          {column.cards.length}
        </span>
      </header>

      <div ref={setNodeRef} className="flex min-h-[72px] flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-2 pt-1">
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <p className="rounded-xl border border-dashed border-rose/70 px-3 py-6 text-center text-xs text-muted">
            Drop a card here
          </p>
        )}
      </div>

      <div className="px-3 pb-3 pt-1">
        <AddCardForm onAdd={(title, details) => onAddCard(column.id, title, details)} />
      </div>
    </section>
  );
}
