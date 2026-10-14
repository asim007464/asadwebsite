/** Sort categories by admin display order (lower = first). Unlisted IDs go after, by name. */
export function sortCategoriesByDisplayOrder<T extends { id: string; name: string }>(
  categories: T[],
  order: Record<string, number> | undefined | null,
): T[] {
  const map = order && typeof order === "object" ? order : {};
  return [...categories].sort((a, b) => {
    const ao = map[a.id];
    const bo = map[b.id];
    const aHas = typeof ao === "number" && Number.isFinite(ao);
    const bHas = typeof bo === "number" && Number.isFinite(bo);
    if (aHas && bHas && ao !== bo) return ao - bo;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function normalizeCategoryDisplayOrder(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = String(id).trim();
    if (!key) continue;
    const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
    if (!Number.isFinite(n)) continue;
    out[key] = Math.max(0, Math.round(n));
  }
  return out;
}

/** Build a dense 0..n-1 order map from an id list (index 0 = first on the homepage). */
export function renumberCategoryDisplayOrder(idsInOrder: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  idsInOrder.forEach((id, i) => {
    const key = String(id).trim();
    if (key) out[key] = i;
  });
  return out;
}

/**
 * Place numbers in admin are 1-based (1 = first).
 * Changing a category’s place swaps it with whoever is already in that slot,
 * then renumbers everyone 0..n-1.
 */
export function swapCategoryDisplayPlace(
  categories: { id: string; name: string }[],
  prevOrder: Record<string, number>,
  categoryId: string,
  place1Based: number,
): Record<string, number> {
  const sorted = sortCategoriesByDisplayOrder(categories, prevOrder);
  const ids = sorted.map((c) => c.id);
  const from = ids.indexOf(categoryId);
  if (from < 0) {
    ids.push(categoryId);
  }
  const fromIdx = ids.indexOf(categoryId);
  const toIdx = Math.max(0, Math.min(ids.length - 1, Math.round(place1Based) - 1));
  if (fromIdx !== toIdx) {
    const tmp = ids[fromIdx]!;
    ids[fromIdx] = ids[toIdx]!;
    ids[toIdx] = tmp;
  }
  return renumberCategoryDisplayOrder(ids);
}

/** Insert a new category at a 1-based place (others shift down). */
export function insertCategoryDisplayPlace(
  categories: { id: string; name: string }[],
  prevOrder: Record<string, number>,
  newCategoryId: string,
  place1Based?: number,
): Record<string, number> {
  const sorted = sortCategoriesByDisplayOrder(
    categories.filter((c) => c.id !== newCategoryId),
    prevOrder,
  );
  const ids = sorted.map((c) => c.id);
  const idx =
    place1Based == null || !Number.isFinite(place1Based)
      ? ids.length
      : Math.max(0, Math.min(ids.length, Math.round(place1Based) - 1));
  ids.splice(idx, 0, newCategoryId);
  return renumberCategoryDisplayOrder(ids);
}

/** Drop a category and renumber the rest. */
export function removeCategoryDisplayPlace(
  categories: { id: string; name: string }[],
  prevOrder: Record<string, number>,
  removedId: string,
): Record<string, number> {
  const sorted = sortCategoriesByDisplayOrder(
    categories.filter((c) => c.id !== removedId),
    prevOrder,
  );
  return renumberCategoryDisplayOrder(sorted.map((c) => c.id));
}
