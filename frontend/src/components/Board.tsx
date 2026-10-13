"use client";

import { useReducer, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardReducer, findColumnByCardId, initialBoard, type Card } from "@/lib/board";
import { CardBody } from "./Card";
import { Column } from "./Column";

export function Board() {
  const [board, dispatch] = useReducer(boardReducer, initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const nextId = useRef(initialBoard.columns.reduce((n, c) => n + c.cards.length, 0) + 1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findCard = (cardId: string) =>
    findColumnByCardId(board, cardId)?.cards.find((card) => card.id === cardId) ?? null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCard(findCard(String(active.id)));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceColumn = findColumnByCardId(board, activeId);
    const targetColumn =
      board.columns.find((column) => column.id === overId) ?? findColumnByCardId(board, overId);

    if (!sourceColumn || !targetColumn) return;

    const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === activeId);
    const targetIndex = targetColumn.cards.findIndex((card) => card.id === overId);
    const toIndex = targetIndex === -1 ? targetColumn.cards.length : targetIndex;

    if (sourceColumn.id === targetColumn.id && sourceIndex === toIndex) return;
    dispatch({
      type: "moveCard",
      cardId: activeId,
      toColumnId: targetColumn.id,
      toIndex,
    });
  };

  return (
    <main className="flex min-h-screen flex-col px-4 pb-6 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col rounded-[28px] border border-white/40 bg-white/55 shadow-[0_25px_80px_rgba(73,58,62,0.12)] backdrop-blur-sm">
        <header className="flex items-end justify-between gap-4 border-b border-line/80 px-5 pb-4 pt-5 sm:px-7 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Product launch board
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-rose/30 bg-blush/70 px-3 py-1.5 text-xs font-medium text-accent shadow-sm sm:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            Team sync ready
          </div>
        </header>

        <DndContext
          id="kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveCard(null)}
        >
          <div className="grid min-h-0 flex-1 grid-cols-5 gap-5 overflow-hidden px-5 py-5 sm:px-7 lg:px-8">
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onRename={(columnId, title) => dispatch({ type: "renameColumn", columnId, title })}
                onAddCard={(columnId, title, details) =>
                  dispatch({
                    type: "addCard",
                    columnId,
                    card: { id: `card-${nextId.current++}`, title, details },
                  })
                }
                onDeleteCard={(cardId) => dispatch({ type: "deleteCard", cardId })}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 180 }}>
            {activeCard ? (
              <article className="w-[260px] cursor-grabbing rounded-2xl border border-l-4 border-accent border-l-accent bg-surface p-3.5 shadow-[0_18px_40px_rgba(73,58,62,0.22)]">
                <CardBody card={activeCard} onDelete={() => {}} />
              </article>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  );
}
