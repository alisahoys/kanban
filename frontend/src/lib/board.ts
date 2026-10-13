export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export type Board = {
  columns: Column[];
};

export type BoardAction =
  | { type: "renameColumn"; columnId: string; title: string }
  | { type: "addCard"; columnId: string; card: Card }
  | { type: "deleteCard"; cardId: string }
  | { type: "moveCard"; cardId: string; toColumnId: string; toIndex: number };

export const initialBoard: Board = {
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cards: [
        {
          id: "card-1",
          title: "Research competitor boards",
          details: "Collect a few reference screenshots and note what feels polished.",
        },
        {
          id: "card-2",
          title: "Define brand voice",
          details: "Short, friendly, and calm. Write three sample empty-state messages.",
        },
      ],
    },
    {
      id: "col-todo",
      title: "To Do",
      cards: [
        {
          id: "card-3",
          title: "Design onboarding checklist",
          details: "Three steps maximum, with a clear progress indicator.",
        },
        {
          id: "card-4",
          title: "Write release notes",
          details: "Summarise the highlights for the first public preview.",
        },
      ],
    },
    {
      id: "col-progress",
      title: "In Progress",
      cards: [
        {
          id: "card-5",
          title: "Build settings page",
          details: "Profile, notifications, and appearance sections.",
        },
      ],
    },
    {
      id: "col-review",
      title: "Review",
      cards: [
        {
          id: "card-6",
          title: "Polish landing page",
          details: "Check spacing, contrast, and mobile layout before sign-off.",
        },
      ],
    },
    {
      id: "col-done",
      title: "Done",
      cards: [
        {
          id: "card-7",
          title: "Set up project repository",
          details: "Linting, formatting, and CI are in place.",
        },
      ],
    },
  ],
};

export function findColumnByCardId(board: Board, cardId: string) {
  return board.columns.find((column) => column.cards.some((card) => card.id === cardId));
}

export function boardReducer(board: Board, action: BoardAction): Board {
  switch (action.type) {
    case "renameColumn":
      return {
        columns: board.columns.map((column) =>
          column.id === action.columnId ? { ...column, title: action.title } : column,
        ),
      };

    case "addCard":
      return {
        columns: board.columns.map((column) =>
          column.id === action.columnId
            ? { ...column, cards: [...column.cards, action.card] }
            : column,
        ),
      };

    case "deleteCard":
      return {
        columns: board.columns.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== action.cardId),
        })),
      };

    case "moveCard": {
      const source = findColumnByCardId(board, action.cardId);
      const target = board.columns.find((column) => column.id === action.toColumnId);
      if (!source || !target) return board;

      const card = source.cards.find((c) => c.id === action.cardId)!;
      const withoutCard = board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((c) => c.id !== action.cardId),
      }));

      return {
        columns: withoutCard.map((column) => {
          if (column.id !== target.id) return column;
          const index = Math.max(0, Math.min(action.toIndex, column.cards.length));
          const cards = [...column.cards];
          cards.splice(index, 0, card);
          return { ...column, cards };
        }),
      };
    }
  }
}
