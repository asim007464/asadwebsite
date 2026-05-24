"use client";

import { useMemo, useState } from "react";
import type { ProductSpecList } from "@/lib/product-spec-lists";

const btnSecondary =
  "inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800";
const btnGhost =
  "inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700";

function emptyList(): ProductSpecList {
  return { heading: "", points: [""] };
}

export function AdminSpecListsField({
  name = "spec_lists_json",
  inputClassName,
  initialLists,
}: {
  name?: string;
  inputClassName: string;
  initialLists?: ProductSpecList[];
}) {
  const [lists, setLists] = useState<ProductSpecList[]>(() =>
    initialLists?.length ? initialLists.map((l) => ({ heading: l.heading, points: l.points.length ? [...l.points] : [""] })) : [emptyList()],
  );

  const jsonValue = useMemo(() => JSON.stringify(lists), [lists]);

  function updateList(index: number, patch: Partial<ProductSpecList>) {
    setLists((prev) => prev.map((list, i) => (i === index ? { ...list, ...patch } : list)));
  }

  function updatePoint(listIndex: number, pointIndex: number, value: string) {
    setLists((prev) =>
      prev.map((list, li) =>
        li === listIndex
          ? { ...list, points: list.points.map((p, pi) => (pi === pointIndex ? value : p)) }
          : list,
      ),
    );
  }

  function addPoint(listIndex: number) {
    setLists((prev) =>
      prev.map((list, i) => (i === listIndex ? { ...list, points: [...list.points, ""] } : list)),
    );
  }

  function removePoint(listIndex: number, pointIndex: number) {
    setLists((prev) =>
      prev.map((list, li) => {
        if (li !== listIndex) return list;
        const next = list.points.filter((_, pi) => pi !== pointIndex);
        return { ...list, points: next.length ? next : [""] };
      }),
    );
  }

  function addList() {
    setLists((prev) => [...prev, emptyList()]);
  }

  function removeList(listIndex: number) {
    setLists((prev) => (prev.length <= 1 ? [emptyList()] : prev.filter((_, i) => i !== listIndex)));
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={jsonValue} readOnly />

      {lists.map((list, listIndex) => (
        <div key={listIndex} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              List heading {lists.length > 1 ? listIndex + 1 : ""}
            </label>
            {lists.length > 1 ? (
              <button type="button" className={btnGhost} onClick={() => removeList(listIndex)}>
                Remove list
              </button>
            ) : null}
          </div>
          <input
            value={list.heading}
            onChange={(e) => updateList(listIndex, { heading: e.target.value })}
            placeholder="e.g. Key features"
            className={inputClassName}
          />

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Points</div>
            <ul className="mt-2 space-y-2">
              {list.points.map((point, pointIndex) => (
                <li key={pointIndex} className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-bold text-blue-700" aria-hidden>
                    •
                  </span>
                  <input
                    value={point}
                    onChange={(e) => updatePoint(listIndex, pointIndex, e.target.value)}
                    placeholder="e.g. 56″ sweep with remote control"
                    className={`${inputClassName} min-w-0 flex-1`}
                  />
                  {list.points.length > 1 ? (
                    <button
                      type="button"
                      className={btnGhost}
                      aria-label="Remove point"
                      onClick={() => removePoint(listIndex, pointIndex)}
                    >
                      ×
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnSecondary} mt-3`} onClick={() => addPoint(listIndex)}>
              + Add point
            </button>
          </div>
        </div>
      ))}

      <button type="button" className={btnSecondary} onClick={addList}>
        + Add another list
      </button>
    </div>
  );
}
