"use client";

import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column as ColumnType } from "@/lib/board";
import { AddCardForm } from "./AddCardForm";
import { SortableCard } from "./Card";

type ColumnProps = {
  column: ColumnType;
  isDropTarget?: boolean;
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

// Subtle visual dot indicators for the 5 stages
const STAGE_DOTS: Record<string, string> = {
  "col-backlog": "bg-muted/70 ring-muted/20",
  "col-todo": "bg-rose ring-rose/30",
  "col-progress": "bg-accent ring-rose/40 animate-pulse",
  "col-review": "bg-accent/80 ring-blush",
  "col-done": "bg-accent ring-accent/30",
};

export function Column({
  column,
  isDropTarget = false,
  onRename,
  onAddCard,
  onDeleteCard,
}: ColumnProps) {
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

  const isActiveOver = isOver || isDropTarget;
  const dotStyle = STAGE_DOTS[column.id] ?? "bg-accent ring-rose/30";

  return (
    <section
      aria-label={column.title}
      className={`flex h-full min-w-[270px] max-w-[340px] flex-1 flex-col rounded-[24px] border transition-all duration-200 sm:min-w-[260px] ${
        isActiveOver
          ? "border-accent bg-blush/90 shadow-[0_16px_32px_rgba(199,125,150,0.22)] ring-2 ring-accent/30"
          : "border-rose/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(243,221,227,0.48))] shadow-[0_4px_16px_rgba(73,58,62,0.03)]"
      }`}
    >
      <header className="group/header flex shrink-0 items-center gap-2 border-b border-line/75 px-4 pb-3 pt-3.5">
        <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ring-4 ${dotStyle}`} />
        <div className="relative flex min-w-0 flex-1 items-center">
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
            title="Click to rename this stage"
            className="w-full truncate rounded-lg bg-transparent px-1.5 py-0.5 text-xs font-bold tracking-[0.06em] text-ink outline-none transition hover:bg-white/60 focus:bg-white focus:ring-2 focus:ring-accent/30"
          />
          <svg
            className="pointer-events-none absolute right-1.5 h-3 w-3 text-muted/40 opacity-0 transition-opacity group-hover/header:opacity-100"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M11.5 2.5a1.414 1.414 0 012 2L4.5 13.5 2 14l.5-2.5 9-9z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          aria-label={`${column.cards.length} cards`}
          className="rounded-full border border-rose/30 bg-white/80 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-accent shadow-xs"
        >
          {column.cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className="flex min-h-[90px] flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3 pt-3"
      >
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <div
            className={`flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
              isActiveOver
                ? "border-accent bg-white/60"
                : "border-rose/50 bg-white/35"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blush/60 text-accent/70">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-2 text-[11.5px] font-medium leading-relaxed text-muted">
              No cards yet
            </p>
            <p className="text-[10.5px] text-muted/70">
              Drop here or add below
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-line/75 px-3 pb-3 pt-2.5">
        <AddCardForm onAdd={(title, details) => onAddCard(column.id, title, details)} />
      </div>
    </section>
  );
}
