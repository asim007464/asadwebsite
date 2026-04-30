/** Demo quotes — swap for real reviews or wire to DB later. */
export type Testimonial = {
  quote: string;
  name: string;
  meta: string;
  initials: string;
};

export const DEMO_TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Ordered a ceiling fan bundle — they confirmed specs on WhatsApp the same day. COD arrived exactly as quoted; motor is whisper-quiet.",
    name: "Hassan R.",
    meta: "Verified buyer · Lahore",
    initials: "HR",
  },
  {
    quote:
      "House wiring reel was genuine copper and labeled clearly. Phone confirmation before dispatch saved us from ordering the wrong gauge.",
    name: "Amina K.",
    meta: "Electrician · Multan",
    initials: "AK",
  },
  {
    quote:
      "LED battens for our shop — bright, even light and fair PKR vs local market. Repeat customer now for small accessories.",
    name: "Bilal M.",
    meta: "Retail · Faisalabad",
    initials: "BM",
  },
  {
    quote:
      "Kitchen mixer arrived packed well; motor feels solid. COD process was straightforward — no surprises on delivery.",
    name: "Sara T.",
    meta: "Verified buyer · Karachi",
    initials: "ST",
  },
  {
    quote:
      "Needed a heater quickly before winter stock ran out. Stock check over call was honest — delivery matched the timeline they gave.",
    name: "Omar N.",
    meta: "Verified buyer · Islamabad",
    initials: "ON",
  },
  {
    quote:
      "Extensions and sockets were exactly as described. Prices were clear, and they confirmed the order before shipping — very professional.",
    name: "Usman A.",
    meta: "Verified buyer · Gujranwala",
    initials: "UA",
  },
  {
    quote:
      "Bought LED bulbs in bulk for our office. Bright light, good packaging, and fast COD delivery. Will order again.",
    name: "Nida S.",
    meta: "Office admin · Rawalpindi",
    initials: "NS",
  },
];
