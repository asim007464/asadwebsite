"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** Ensures each client navigation shows the new page from the top (document scroll). */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
