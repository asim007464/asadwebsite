/** One heading (optional) + one or more body paragraphs. */
export type ProseSection = { heading?: string; paragraphs: string[] };

/**
 * Split admin free-text into readable sections.
 * Supports `## Heading` markers and blank-line paragraph breaks.
 */
export function splitProseSections(raw: string): ProseSection[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const chunks = text.split(/\n(?=##\s*)/);
  const sections: ProseSection[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^##\s*([\s\S]+)$/);
    if (headingMatch) {
      const rest = headingMatch[1].trim();
      let heading = "";
      let body = "";
      if (rest.includes("\n")) {
        const nl = rest.indexOf("\n");
        heading = rest.slice(0, nl).trim().replace(/[.。]+$/, "");
        body = rest.slice(nl + 1).trim();
      } else {
        // `## Title. More body…` on one line — first sentence becomes the heading.
        const inline = rest.match(/^(.{8,100}?[.!?])\s+([\s\S]+)$/);
        if (inline) {
          heading = inline[1].trim().replace(/[.!?]+$/, "");
          body = inline[2].trim();
        } else {
          heading = rest.replace(/[.。]+$/, "");
        }
      }
      const paragraphs = splitParagraphs(body);
      sections.push(paragraphs.length ? { heading, paragraphs } : { heading, paragraphs: [] });
      continue;
    }

    const paragraphs = splitParagraphs(trimmed);
    if (paragraphs.length) sections.push({ paragraphs });
  }

  return sections;
}

function splitParagraphs(body: string): string[] {
  const byBlank = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n+/g, " ").trim())
    .filter(Boolean);

  if (byBlank.length > 1) return byBlank;
  if (!byBlank.length) return [];

  const single = byBlank[0];
  // Long wall of text → soft-split every ~2–3 sentences for readability.
  if (single.length < 320) return [single];

  const sentences = single.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [single];
  const groups: string[] = [];
  let buf = "";
  for (const s of sentences) {
    const next = `${buf}${s}`.trim();
    if (buf && next.length > 280) {
      groups.push(buf.trim());
      buf = s;
    } else {
      buf = next + (s.endsWith(" ") ? "" : " ");
    }
  }
  if (buf.trim()) groups.push(buf.trim());
  return groups.length ? groups : [single];
}
