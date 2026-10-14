"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  boardReducer,
  findColumnByCardId,
  initialBoard,
  type Card,
} from "@/lib/board";
import { CardBody } from "./Card";
import { Column } from "./Column";

export function Board() {
  const [board, dispatch] = useReducer(boardReducer, initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const nextId = useRef(initialBoard.columns.reduce((n, c) => n + c.cards.length, 0) + 1);
  const cardCount = board.columns.reduce((total, column) => total + column.cards.length, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findCard = (cardId: string) =>
    findColumnByCardId(board, cardId)?.cards.find((card) => card.id === cardId) ?? null;

  // Collision detection that prioritizes cards under the pointer to prevent jumping
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        // Prioritize card collisions over the column background
        const cardCollision = pointerCollisions.find((c) =>
          board.columns.some((col) => col.cards.some((card) => card.id === c.id)),
        );
        if (cardCollision) return [cardCollision];
        return pointerCollisions;
      }
      return closestCenter(args);
    },
    [board.columns],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCard(findCard(String(active.id)));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnByCardId(board, activeId);
    const targetColumn =
      board.columns.find((c) => c.id === overId) ?? findColumnByCardId(board, overId);

    if (!sourceColumn || !targetColumn) {
      setOverColumnId(null);
      return;
    }

    setOverColumnId(targetColumn.id);

    // Live cross-column transfer so cards in the target column open up cleanly
    if (sourceColumn.id !== targetColumn.id) {
      const overIndex = targetColumn.cards.findIndex((c) => c.id === overId);
      const toIndex = overIndex === -1 ? targetColumn.cards.length : overIndex;

      dispatch({
        type: "moveCard",
        cardId: activeId,
        toColumnId: targetColumn.id,
        toIndex,
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    setOverColumnId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnByCardId(board, activeId);
    const targetColumn =
      board.columns.find((c) => c.id === overId) ?? findColumnByCardId(board, overId);

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const oldIndex = sourceColumn.cards.findIndex((c) => c.id === activeId);
      const newIndex = sourceColumn.cards.findIndex((c) => c.id === overId);

      if (newIndex !== -1 && oldIndex !== newIndex) {
        dispatch({
          type: "moveCard",
          cardId: activeId,
          toColumnId: sourceColumn.id,
          toIndex: newIndex,
        });
      }
    } else {
      const overIndex = targetColumn.cards.findIndex((c) => c.id === overId);
      const toIndex = overIndex === -1 ? targetColumn.cards.length : overIndex;
      dispatch({
        type: "moveCard",
        cardId: activeId,
        toColumnId: targetColumn.id,
        toIndex,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
    setOverColumnId(null);
  };

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden">
      {/* Full-width frosted header sitting directly on the pink canvas */}
      <header className="flex shrink-0 flex-col gap-3.5 border-b border-rose/35 bg-white/45 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-md shadow-accent/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="4" width="7" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Workspace
              </p>
              <span className="text-muted/40">•</span>
              <p className="text-[10px] font-medium text-muted">Kanban Board</p>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Product launch board
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-rose/40 bg-blush/80 px-3.5 py-1.5 text-xs font-semibold text-accent shadow-xs">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span>{cardCount} {cardCount === 1 ? "card" : "cards"}</span>
            <span className="text-accent/40">•</span>
            <span className="text-muted">{board.columns.length} stages</span>
          </div>
        </div>
      </header>

      {/* Edge-to-edge board canvas spanning all the way down to the bottom of the screen */}
      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-0 flex-1 gap-5 overflow-x-auto overflow-y-hidden px-6 py-5 lg:px-8">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              isDropTarget={overColumnId === column.id}
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

        {portalRoot
          ? createPortal(
              <DragOverlay dropAnimation={{ duration: 160 }}>
                {activeCard ? (
                  <article className="w-[280px] rotate-[1.5deg] scale-[1.02] cursor-grabbing rounded-[18px] border border-l-4 border-accent border-l-accent bg-surface p-3.5 shadow-[0_22px_45px_rgba(73,58,62,0.24)] ring-2 ring-accent/30">
                    <CardBody card={activeCard} isOverlay />
                  </article>
                ) : null}
              </DragOverlay>,
              portalRoot,
            )
          : null}
      </DndContext>
    </main>
  );
}
