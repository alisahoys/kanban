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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rose/60 bg-white/55 px-3 py-2.5 text-sm font-medium text-muted transition hover:border-accent hover:bg-blush/80 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-base leading-none text-accent">
          +
        </span>
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
      className="space-y-2.5 rounded-2xl border border-line bg-surface/95 p-3 shadow-[0_12px_24px_rgba(73,58,62,0.08)]"
    >
      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        New card
      </label>
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Card title"
        aria-label="Card title"
        className="w-full rounded-xl border border-line bg-page px-2.5 py-2 text-sm text-ink outline-none placeholder:text-muted transition focus:border-accent focus:ring-3 focus:ring-accent/15"
      />
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Details"
        aria-label="Card details"
        rows={3}
        className="w-full resize-none rounded-xl border border-line bg-page px-2.5 py-2 text-sm text-ink outline-none placeholder:text-muted transition focus:border-accent focus:ring-3 focus:ring-accent/15"
      />
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-beige"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
