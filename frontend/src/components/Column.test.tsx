import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialBoard } from "@/lib/board";
import { Column } from "./Column";

describe("Column rename", () => {
  it("cancels a draft when Escape is pressed", () => {
    const onRename = vi.fn();
    const column = initialBoard.columns[0];

    render(
      <Column
        column={column}
        onRename={onRename}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Rename column Backlog" });
    fireEvent.change(input, { target: { value: "Canceled name" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onRename).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("Backlog");
  });
});
