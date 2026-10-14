"use client";

import { useState } from "react";

type AddCardFormProps = {
  onAdd: (title: string, details: string) => void;
};

export function AddCardForm({ onAdd }: AddCardFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const reset = () => {
    setTitle("");
    setDetails("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rose/60 bg-white/60 px-3 py-2.5 text-xs font-semibold tracking-wide text-muted transition-all duration-150 hover:border-accent hover:bg-blush/80 hover:text-accent hover:shadow-sm focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.99]"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-sm font-bold leading-none text-accent transition-transform duration-150 group-hover:scale-110"
        >
          +
        </span>
        Add card
      </button>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      reset();
    } else if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      const trimmed = title.trim();
      if (trimmed) {
        onAdd(trimmed, details.trim());
        reset();
      }
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        onAdd(trimmed, details.trim());
        reset();
      }}
      onKeyDown={handleKeyDown}
      className="space-y-2.5 rounded-[18px] border border-line/90 bg-surface p-3 shadow-[0_8px_20px_rgba(73,58,62,0.08)] ring-1 ring-accent/10"
    >
      <div className="flex items-center justify-between">
        <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">
          New Card
        </label>
        <span className="text-[10px] text-muted/60">Esc to cancel</span>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Card title..."
        aria-label="Card title"
        className="w-full rounded-xl border border-line bg-page/70 px-3 py-2 text-xs font-medium text-ink outline-none placeholder:text-muted/60 transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
      />
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Details or notes (optional)..."
        aria-label="Card details"
        rows={3}
        className="w-full resize-none rounded-xl border border-line bg-page/70 px-3 py-2 text-xs text-ink outline-none placeholder:text-muted/60 transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
      />
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-beige/60 hover:text-ink active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
        <span className="text-[10px] text-muted/50">↵ / ⌘↵ to save</span>
      </div>
    </form>
  );
}
