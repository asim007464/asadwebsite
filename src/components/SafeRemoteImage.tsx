"use client";

import Image, { type ImageProps } from "next/image";
import { startTransition, useCallback, useState } from "react";

type SafeRemoteImageProps = Omit<ImageProps, "onError" | "src"> & {
  src: string | null | undefined;
};

/**
 * Uses next/image when allowed; if loading fails (unknown host, optimizer error), falls back to <img>.
 */
export function SafeRemoteImage({ src, alt, className, ...rest }: SafeRemoteImageProps) {
  const [fallback, setFallback] = useState(false);

  const handleError = useCallback(() => {
    if (typeof window === "undefined") return;
    startTransition(() => setFallback(true));
  }, []);

  if (!src) return null;

  if (fallback) {
    const imgClass =
      "fill" in rest && rest.fill
        ? `absolute inset-0 h-full w-full ${className?.includes("object-") ? "" : "object-cover"} ${className ?? ""}`
        : className;
    return (
      <img
        src={src}
        alt={alt}
        width={"fill" in rest && rest.fill ? undefined : rest.width}
        height={"fill" in rest && rest.fill ? undefined : rest.height}
        className={imgClass}
        loading={rest.priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return <Image src={src} alt={alt} className={className} onError={handleError} {...rest} unoptimized />;
}
