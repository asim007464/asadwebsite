"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

function scrollDocumentToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Ensures each client navigation shows the new page from the top (document scroll). */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollDocumentToTop();
  }, [pathname]);

  // Run again after other components' useEffects (e.g. carousels) that might nudge scroll.
  useEffect(() => {
    scrollDocumentToTop();
    const id = requestAnimationFrame(scrollDocumentToTop);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
