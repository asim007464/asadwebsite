"use client";

import Image, { type ImageProps } from "next/image";
import { startTransition, useCallback, useState } from "react";

type SafeRemoteImageProps = Omit<ImageProps, "onError" | "onLoad" | "src"> & {
  src: string | null | undefined;
};

/**
 * Uses next/image when allowed; if loading fails (unknown host, optimizer error), falls back to <img>.
 * Shows a pulse skeleton while the image loads (fill layouts).
 */
export function SafeRemoteImage({ src, alt, className, ...rest }: SafeRemoteImageProps) {
  const [fallback, setFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isFill = "fill" in rest && Boolean(rest.fill);

  const handleError = useCallback(() => {
    if (typeof window === "undefined") return;
    startTransition(() => {
      setFallback(true);
      setLoaded(true);
    });
  }, []);

  const handleLoad = useCallback(() => {
    startTransition(() => setLoaded(true));
  }, []);

  if (!src) return null;

  if (fallback) {
    const imgClass = isFill
      ? `absolute inset-0 h-full w-full ${className?.includes("object-") ? "" : "object-cover"} ${className ?? ""}`
      : className;
    return (
      <img
        src={src}
        alt={alt}
        width={isFill ? undefined : rest.width}
        height={isFill ? undefined : rest.height}
        className={imgClass}
        loading={rest.priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <>
      {isFill && !loaded ? (
        <div
          aria-hidden
          className="absolute inset-0 z-[5] animate-pulse bg-slate-200/80 motion-reduce:animate-none"
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        className={`${className ?? ""} ${isFill && !loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
        unoptimized
      />
    </>
  );
}
