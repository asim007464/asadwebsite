"use client";

import { useRef } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  rows?: number;
  className?: string;
  placeholder?: string;
};

/** Textarea with a Bold control that wraps the selection in **…**. */
export function BoldableTextarea({ name, defaultValue = "", rows = 5, className, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function makeBold() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    const selected = value.slice(start, end);
    if (!selected) {
      el.focus();
      return;
    }
    const next = `${value.slice(0, start)}**${selected}**${value.slice(end)}`;
    el.value = next;
    const cursor = start + selected.length + 4;
    el.setSelectionRange(cursor, cursor);
    el.focus();
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={makeBold}
          className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50"
          title="Wrap selected text in bold (**…**)"
        >
          B
        </button>
        <span className="text-[11px] text-slate-500">
          Select text, then click <span className="font-bold text-slate-700">B</span> — or type{" "}
          <code className="rounded bg-slate-100 px-1">**like this**</code>
        </span>
      </div>
      <textarea
        ref={ref}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
}
