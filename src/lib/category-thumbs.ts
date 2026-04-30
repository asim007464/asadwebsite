export type CategoryThumb = { url: string; alt: string };

/**
 * Deterministic thumbnails for category cards.
 * Swap these URLs with your own Supabase Storage images later.
 */
const THUMBS: Record<string, CategoryThumb> = {
  "breakers-protection": { url: "https://picsum.photos/id/1060/1200/900", alt: "Electrical breakers" },
  "conduits-accessories": { url: "https://picsum.photos/id/1056/1200/900", alt: "Conduits and accessories" },
  "fans-cooling": { url: "https://picsum.photos/id/1080/1200/900", alt: "Ceiling fan" },
  heaters: { url: "https://picsum.photos/id/1072/1200/900", alt: "Room heater" },
  "kitchen-appliances": { url: "https://picsum.photos/id/292/1200/900", alt: "Kitchen appliances" },
  "lighting-leds": { url: "https://picsum.photos/id/1011/1200/900", alt: "LED lighting" },
  "personal-care": { url: "https://picsum.photos/id/1027/1200/900", alt: "Personal care tools" },
  "power-cables": { url: "https://picsum.photos/id/1048/1200/900", alt: "Power extensions and cables" },
  "switches-sockets": { url: "https://picsum.photos/id/1050/1200/900", alt: "Switches and sockets" },
  "wires-cables": { url: "https://picsum.photos/id/1039/1200/900", alt: "Wires and cables" },
};

export function getCategoryThumb(slug: string): CategoryThumb {
  const key = slug.toLowerCase();
  return (
    THUMBS[key] ?? {
      url: "https://picsum.photos/id/1033/1200/900",
      alt: "Category thumbnail",
    }
  );
}

