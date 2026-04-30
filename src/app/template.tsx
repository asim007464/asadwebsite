import type { ReactNode } from "react";

/** Re-mounts on client navigations — subtle enter animation for each page. */
export default function RootTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 motion-safe:animate-page-enter motion-reduce:animate-none">{children}</div>
  );
}
