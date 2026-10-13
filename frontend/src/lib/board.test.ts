import { describe, expect, it } from "vitest";
import { boardReducer, initialBoard } from "./board";

const titles = (board: typeof initialBoard, columnId: string) =>
  board.columns.find((c) => c.id === columnId)!.cards.map((c) => c.id);

describe("boardReducer", () => {
  it("starts with 5 columns", () => {
    expect(initialBoard.columns).toHaveLength(5);
  });

  it("renames a column without changing the column count", () => {
    const next = boardReducer(initialBoard, {
      type: "renameColumn",
      columnId: "col-todo",
      title: "Next up",
    });
    expect(next.columns).toHaveLength(5);
    expect(next.columns.find((c) => c.id === "col-todo")!.title).toBe("Next up");
  });

  it("adds a card to the end of a column", () => {
    const next = boardReducer(initialBoard, {
      type: "addCard",
      columnId: "col-done",
      card: { id: "card-new", title: "New", details: "" },
    });
    expect(titles(next, "col-done").at(-1)).toBe("card-new");
  });

  it("deletes a card", () => {
    const next = boardReducer(initialBoard, { type: "deleteCard", cardId: "card-5" });
    expect(titles(next, "col-progress")).toEqual([]);
  });

  it("moves a card between columns at a given index", () => {
    const next = boardReducer(initialBoard, {
      type: "moveCard",
      cardId: "card-1",
      toColumnId: "col-todo",
      toIndex: 1,
    });
    expect(titles(next, "col-backlog")).toEqual(["card-2"]);
    expect(titles(next, "col-todo")).toEqual(["card-3", "card-1", "card-4"]);
  });

  it("reorders a card within its column", () => {
    const next = boardReducer(initialBoard, {
      type: "moveCard",
      cardId: "card-1",
      toColumnId: "col-backlog",
      toIndex: 1,
    });
    expect(titles(next, "col-backlog")).toEqual(["card-2", "card-1"]);
  });

  it("ignores moves for unknown cards or columns", () => {
    expect(
      boardReducer(initialBoard, {
        type: "moveCard",
        cardId: "nope",
        toColumnId: "col-todo",
        toIndex: 0,
      }),
    ).toBe(initialBoard);
  });
});
