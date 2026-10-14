"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/board";

type CardProps = {
  card: CardType;
  onDelete?: (cardId: string) => void;
  isOverlay?: boolean;
};

export function CardBody({ card, onDelete, isOverlay }: CardProps) {
  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {card.title}
        </h3>
        {!isOverlay && onDelete && (
          <button
            type="button"
            aria-label={`Delete ${card.title}`}
            onPointerDown={(event) => {
              // Prevent drag sensor activation when clicking delete button
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(card.id);
            }}
            className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted/70 transition-all hover:bg-blush hover:text-accent focus-visible:outline-2 focus-visible:outline-accent sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            title="Delete card"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {card.details && (
        <p className="mt-2.5 whitespace-pre-line break-words rounded-xl border border-line/60 bg-beige/25 px-2.5 py-2 text-[12px] leading-relaxed text-muted">
          {card.details}
        </p>
      )}
    </div>
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
      className={`group cursor-grab touch-none select-none rounded-[18px] border border-l-4 border-line/90 border-l-rose bg-surface p-3.5 shadow-[0_2px_8px_rgba(73,58,62,0.04)] transition-[border-color,box-shadow] duration-150 hover:border-rose/80 hover:border-l-accent hover:shadow-[0_12px_24px_rgba(199,125,150,0.14)] active:cursor-grabbing ${
        isDragging
          ? "border-dashed border-accent/60 bg-blush/30 opacity-40 shadow-none ring-2 ring-accent/20"
          : ""
      }`}
    >
      <CardBody card={card} onDelete={onDelete} />
    </article>
  );
}
