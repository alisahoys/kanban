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
  type DragOverEvent,
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

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnByCardId(board, activeId);
    const targetColumn =
      board.columns.find((column) => column.id === overId) ?? findColumnByCardId(board, overId);
    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return;

    const overIndex = targetColumn.cards.findIndex((card) => card.id === overId);
    dispatch({
      type: "moveCard",
      cardId: activeId,
      toColumnId: targetColumn.id,
      toIndex: overIndex === -1 ? targetColumn.cards.length : overIndex,
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const column = findColumnByCardId(board, activeId);
    if (!column) return;
    const oldIndex = column.cards.findIndex((card) => card.id === activeId);
    const newIndex = column.cards.findIndex((card) => card.id === overId);
    if (newIndex === -1 || oldIndex === newIndex) return;

    dispatch({ type: "moveCard", cardId: activeId, toColumnId: column.id, toIndex: newIndex });
  };

  return (
    <main className="flex h-screen flex-col">
      <header className="px-8 pb-4 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Kanban<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Drag cards between columns to keep work moving.</p>
      </header>

      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveCard(null)}
      >
        <div className="flex min-h-0 flex-1 items-start gap-5 overflow-x-auto px-8 pb-8">
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
            <article className="rotate-2 cursor-grabbing rounded-xl border border-l-4 border-accent/50 border-l-accent bg-surface p-3.5 shadow-[0_14px_32px_rgba(73,58,62,0.22)]">
              <CardBody card={activeCard} onDelete={() => {}} />
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
