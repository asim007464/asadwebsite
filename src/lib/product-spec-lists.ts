/** Feature / spec bullet lists stored on `product_variants.options.spec_lists`. */

export type ProductSpecList = {
  heading: string;
  points: string[];
};

export const SPEC_LISTS_OPTIONS_KEY = "spec_lists";

export function normalizeSpecLists(lists: ProductSpecList[]): ProductSpecList[] {
  return lists
    .map((list) => ({
      heading: list.heading.trim(),
      points: list.points.map((p) => p.trim()).filter(Boolean),
    }))
    .filter((list) => list.heading.length > 0 || list.points.length > 0);
}

export function parseSpecListsJson(raw: string): ProductSpecList[] {
  if (!raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const lists: ProductSpecList[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const heading = typeof (item as ProductSpecList).heading === "string" ? (item as ProductSpecList).heading : "";
      const pointsRaw = (item as ProductSpecList).points;
      const points = Array.isArray(pointsRaw)
        ? pointsRaw.filter((p): p is string => typeof p === "string")
        : [];
      lists.push({ heading, points });
    }
    return normalizeSpecLists(lists);
  } catch {
    return [];
  }
}

export function specListsFromOptions(options: Record<string, unknown> | null | undefined): ProductSpecList[] {
  const raw = options?.[SPEC_LISTS_OPTIONS_KEY];
  if (!Array.isArray(raw)) return [];
  const lists: ProductSpecList[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const heading = typeof (item as ProductSpecList).heading === "string" ? (item as ProductSpecList).heading : "";
    const pointsRaw = (item as ProductSpecList).points;
    const points = Array.isArray(pointsRaw)
      ? pointsRaw.filter((p): p is string => typeof p === "string")
      : [];
    lists.push({ heading, points });
  }
  return normalizeSpecLists(lists);
}

export function specListsToOptions(lists: ProductSpecList[]): Record<string, unknown> {
  const normalized = normalizeSpecLists(lists);
  if (!normalized.length) return {};
  return { [SPEC_LISTS_OPTIONS_KEY]: normalized };
}

export function variantTitleFromSpecLists(lists: ProductSpecList[], fallback: string): string {
  const normalized = normalizeSpecLists(lists);
  const withHeading = normalized.find((l) => l.heading.length > 0);
  if (withHeading) return withHeading.heading;
  const firstPoint = normalized.flatMap((l) => l.points)[0];
  if (firstPoint) return firstPoint.length > 120 ? `${firstPoint.slice(0, 117)}…` : firstPoint;
  const fb = fallback.trim();
  return fb.length > 0 ? fb : "Standard";
}
