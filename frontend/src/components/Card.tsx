"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/board";

type CardProps = {
  card: CardType;
  onDelete: (cardId: string) => void;
};

export function CardBody({ card, onDelete }: CardProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-ink">{card.title}</h3>
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onClick={() => onDelete(card.id)}
          className="-mr-1 -mt-1 rounded-md p-1 text-muted opacity-0 transition hover:bg-blush hover:text-accent focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {card.details && (
        <p className="mt-2 rounded-lg bg-beige/30 px-2 py-1.5 text-[12.5px] leading-relaxed text-muted">
          {card.details}
        </p>
      )}
    </>
  );
}

export function SortableCard({ card, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`group cursor-grab touch-none rounded-2xl border border-l-4 border-blush border-l-rose bg-surface/95 p-3.5 shadow-[0_10px_18px_rgba(73,58,62,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose hover:border-l-accent hover:shadow-[0_16px_28px_rgba(199,125,150,0.18)] active:cursor-grabbing ${
        isDragging ? "scale-[0.985] opacity-40" : ""
      }`}
    >
      <CardBody card={card} onDelete={onDelete} />
    </article>
  );
}
