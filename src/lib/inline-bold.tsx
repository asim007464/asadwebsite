import type { ReactNode } from "react";

/** Render `**bold**` spans as <strong>; all other text stays plain. */
export function InlineBoldText({ text }: { text: string }): ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-slate-800">
          {m[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
