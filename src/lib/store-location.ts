/**
 * Registered Google Business Profile for this shop.
 * Embed uses Google's place feature id so the named listing shows (not only raw coordinates).
 */
export const STORE_LOCATION = {
  name: "Al Makkah Electric Traders",
  lat: 31.0658769,
  lng: 72.9439501,
  /** From Maps URL …1s0x3922f15e62348bcf:0xd4712bb9e23c818e — ties iframe to the Business Profile */
  googlePlaceFeatureRef: "0x3922f15e62348bcf:0xd4712bb9e23c818e",
  googleMapsPlaceUrl:
    "https://www.google.com/maps/place/Al+Makkah+Electric+Traders/@31.0658769,72.9439501,17z/data=!3m1!4b1!4m6!3m5!1s0x3922f15e62348bcf:0xd4712bb9e23c818e!8m2!3d31.0658769!4d72.9439501!16s%2Fg%2F11ynf8lkz5",
} as const;

/** Official `/maps/embed?pb=…` payload — pins the registered Business Profile (not only lat/lng). */
export function googleMapsEmbedSrc(lat: number, lng: number, placeFeatureRef: string, placeTitleForEmbed: string) {
  const refSeg = placeFeatureRef.replace(/:/g, "%3A");
  const titleSeg = encodeURIComponent(placeTitleForEmbed);
  const pb =
    `!1m18!1m12!1m3!1d3414.738945679912!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${refSeg}!2s${titleSeg}!5e0!3m2!1sen!2spk!4v1735564800000!5m2!1sen!2spk`;
  return `https://www.google.com/maps/embed?pb=${pb}`;
}
