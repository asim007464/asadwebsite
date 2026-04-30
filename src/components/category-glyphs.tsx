import type { ReactNode } from "react";

const stroke = {
  strokeWidth: 1.65,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-10 w-10"} fill="none" stroke="currentColor" aria-hidden {...stroke}>
      {children}
    </svg>
  );
}

/** Inline SVGs keyed loosely off category slug — unknown slugs get a neutral package icon. */
export function CategoryGlyph({ slug }: { slug: string }) {
  const s = slug.toLowerCase();

  if (s.includes("fan") || s.includes("cool")) {
    return (
      <Svg>
        <circle cx="12" cy="12" r="2.35" />
        <path d="M12 3.5v2.8M12 17.7v2.8M3.5 12h2.8M17.7 12h2.8M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      </Svg>
    );
  }

  if (s.includes("light") || s.includes("led")) {
    return (
      <Svg>
        <path d="M12 3a6 6 0 016 6c0 2.8-2 4.8-3 6H9c-1-1.2-3-3.2-3-6a6 6 0 016-6z" />
        <path d="M9 17h6v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1zM10 21h4" />
      </Svg>
    );
  }

  if (s.includes("heat")) {
    return (
      <Svg>
        <path d="M8 20c-2-3-1.5-6 0.5-8.5s3-4 3-6.5c1 2 2 3.5 2 5.5 0 2.5-2 4.5-2 7 0 2 1 2.5 1 2.5" />
        <path d="M12 20c-1.5-2.5-1-5 1-7.5s2.5-4 2-6c1.5 2 2 4 1 6.5s-2 4.5-1 7" />
      </Svg>
    );
  }

  if (s.includes("kitchen")) {
    return (
      <Svg>
        <path d="M8 10h8v9a2 2 0 01-2 2h-4a2 2 0 01-2-2v-9zM10 10V8a2 2 0 114 0v2" />
        <path d="M9 14h6M9 17h4" />
      </Svg>
    );
  }

  if (s.includes("personal") || s.includes("groom")) {
    return (
      <Svg>
        <circle cx="8" cy="9" r="3.25" />
        <path d="M13 18l6-10M11 18l-3-5M17 8l2 2" />
      </Svg>
    );
  }

  if (s.includes("power") || (s.includes("cable") && !s.includes("wire"))) {
    return (
      <Svg>
        <path d="M8 10V8a2 2 0 012-2h2v10M8 14v4h8v-4M12 6v2" />
        <path d="M10 18v2M14 18v2" />
      </Svg>
    );
  }

  if (s.includes("breaker")) {
    return (
      <Svg>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M10 9h4M10 13h4M12 9v8" />
      </Svg>
    );
  }

  if (s.includes("conduit")) {
    return (
      <Svg>
        <path d="M6 18h6l6-6V6M12 18v-4l4-4M8 14l4-4 4-4" />
      </Svg>
    );
  }

  if (s.includes("switch") || s.includes("socket")) {
    return (
      <Svg>
        <rect x="5" y="7" width="14" height="10" rx="2" />
        <path d="M9 12h6M12 9v6" />
      </Svg>
    );
  }

  if (s.includes("wire")) {
    return (
      <Svg>
        <path d="M5 16c2.5-2 4-5 7-5s5 3 7 6M5 8c2 2 4 3 6 1s5-3 8-1" />
        <circle cx="7" cy="17" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="17" cy="9" r="1.35" fill="currentColor" stroke="none" />
      </Svg>
    );
  }

  return (
    <Svg>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
      <path d="M12 4v16M4 8l16 8M20 8L4 16" opacity="0.55" />
    </Svg>
  );
}
