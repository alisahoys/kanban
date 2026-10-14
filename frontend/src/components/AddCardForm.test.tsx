import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddCardForm } from "./AddCardForm";

describe("AddCardForm", () => {
  it("opens form and submits a new card with title and details", () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    // Click "Add card" trigger
    fireEvent.click(screen.getByRole("button", { name: /add card/i }));

    const titleInput = screen.getByPlaceholderText(/card title/i);
    const detailsInput = screen.getByPlaceholderText(/details or notes/i);

    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(detailsInput, { target: { value: "Some details" } });

    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith("New Task", "Some details");
    // Form should reset to the closed trigger button
    expect(screen.getByRole("button", { name: /add card/i })).toBeDefined();
  });

  it("closes and resets when Escape is pressed", () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /add card/i }));

    const titleInput = screen.getByPlaceholderText(/card title/i);
    fireEvent.change(titleInput, { target: { value: "Draft Title" } });
    fireEvent.keyDown(titleInput, { key: "Escape" });

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /add card/i })).toBeDefined();
  });

  it("submits with Ctrl+Enter or Cmd+Enter", () => {
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /add card/i }));

    const titleInput = screen.getByPlaceholderText(/card title/i);
    fireEvent.change(titleInput, { target: { value: "Shortcut Task" } });
    fireEvent.keyDown(titleInput, { key: "Enter", ctrlKey: true });

    expect(onAdd).toHaveBeenCalledWith("Shortcut Task", "");
  });
});
