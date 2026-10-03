type CategoryOption = { id: string; name: string };

export function AdminCategoryMultiSelect({
  categories,
  selectedIds = [],
}: {
  categories: CategoryOption[];
  selectedIds?: string[];
}) {
  const selected = new Set(selectedIds);

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Categories <span className="font-normal normal-case text-slate-400">(select one or more)</span>
      </label>
      {categories.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No categories yet. Create some under Admin → Categories first.
        </p>
      ) : (
        <div className="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  name="category_ids"
                  value={c.id}
                  defaultChecked={selected.has(c.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <p className="mt-1 text-[11px] text-slate-500">
        A product can appear in multiple shop categories. The first checked category is used as the primary label.
      </p>
    </div>
  );
}
