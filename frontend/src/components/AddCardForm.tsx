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
        className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-blush hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span aria-hidden="true" className="text-base leading-none">+</span>
        Add card
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        onAdd(trimmed, details.trim());
        reset();
      }}
      className="space-y-2 rounded-xl border border-line bg-surface p-3 shadow-[0_1px_2px_rgba(73,58,62,0.05)]"
    >
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Card title"
        aria-label="Card title"
        className="w-full rounded-lg border border-line bg-page px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Details"
        aria-label="Card details"
        rows={3}
        className="w-full resize-none rounded-lg border border-line bg-page px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-beige"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
