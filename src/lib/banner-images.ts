/** Resolve desktop/mobile banner image URLs from admin settings. */
export function resolveBannerImages(
  desktopRaw: string | null | undefined,
  mobileRaw: string | null | undefined,
  separate: boolean | null | undefined,
) {
  const desktop = (desktopRaw ?? "").trim();
  const mobileStored = (mobileRaw ?? "").trim();
  const useSeparate = Boolean(separate) && mobileStored.length > 0;
  const mobile = useSeparate ? mobileStored : desktop;
  return { desktop, mobile, separate: useSeparate };
}

export function cssUrl(src: string) {
  return `url(${JSON.stringify(src).slice(1, -1)})`;
}
