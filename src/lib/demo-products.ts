export type DemoProduct = {
  sku: string;
  name: string;
  category: string;
  specs: string[];
  description: string;
  pricePkr: number;
  compareAtPkr?: number;
  imageUrl: string;
  badge?: string;
  unit?: string;
  warranty?: string;
  stockHint?: string;
  origin?: string;
  highlights?: string[];
};

/** Demo-only listings — home appliances & small electrics (PKR / specs style for client previews). */
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    sku: "DEMO-FAN-56-RC",
    name: "Ceiling fan — 56″ 3‑blade with remote",
    category: "Fans & cooling",
    specs: ["230V ~50Hz", "High airflow motor", "Timer & sleep modes", "Walnut / matte white trims"],
    description:
      "Ideal for lounges and bedrooms—quiet bearings, reversible winter mode, and bundled RF remote. Swap finishes per your supplier catalog.",
    pricePkr: 18450,
    compareAtPkr: 20900,
    imageUrl:
      "https://images.unsplash.com/photo-1585771720464-a89680577fb9?auto=format&fit=crop&w=1200&q=80",
    badge: "Hot seller",
    unit: "per set (motor + blades + remote)",
    warranty: "2‑year motor service (typical retail — confirm brand)",
    stockHint: "Twin packs available for duplex jobs — ask on WhatsApp",
    highlights: ["Anti-rust blade coating option", "LED under-light kits sold separately"],
  },
  {
    sku: "DEMO-LED-A60-12W-PK6",
    name: "LED bulb pack — 12W daylight A60 (6 pcs)",
    category: "Lighting & LEDs",
    specs: ["6500K daylight", "≈1100 lm each", "E27 screw base", "Flicker‑safe driver"],
    description:
      "Household retrofit bundle for kitchens, corridors, and shops—low heat, instant on. Show lumens + colour temp on the live PDP.",
    pricePkr: 2450,
    imageUrl:
      "https://images.unsplash.com/photo-1517991104113-39f79406ff63?auto=format&fit=crop&w=1200&q=80",
    badge: "Energy saver",
    unit: "per box (6 bulbs)",
    stockHint: "Warm white SKU available — mention preference when ordering",
    highlights: ["Compatible with most ceiling holders", "Bulk contractor trays on request"],
  },
  {
    sku: "DEMO-HTR-PTC-2000",
    name: "Room heater — 2000W ceramic tower",
    category: "Heaters",
    specs: ["Tip‑over cut‑out", "Oscillation", "2 heat levels + fan‑only", "Carry handle"],
    description:
      "Compact tower for winter desk/lounge use—demo layout shows safety badges (cut‑out, overheat) beside wattage callouts.",
    pricePkr: 12900,
    compareAtPkr: 14450,
    imageUrl:
      "https://images.unsplash.com/photo-1610375461369-d613b296fa34?auto=format&fit=crop&w=1200&q=80",
    unit: "per piece",
    warranty: "1‑year demo warranty copy",
    stockHint: "High season — confirm courier box reinforcement",
    highlights: ["Oil-filled radiators listed separately", "Voltage stabilizer advised on weak lines"],
  },
  {
    sku: "DEMO-COOL-HNY-45L",
    name: "Evaporative air cooler — 45L honeycomb",
    category: "Fans & cooling",
    specs: ["Ice chamber", "Casters + vertical louvers", "Low noise pump", "Louvre swing"],
    description:
      "Desert cooler style flow—great for dry heat waves. Pair with cross‑ventilation tips in your FAQ when you go live.",
    pricePkr: 28900,
    imageUrl:
      "https://images.unsplash.com/photo-1616432043567-7b36030f536b?auto=format&fit=crop&w=1200&q=80",
    badge: "Seasonal",
    unit: "per unit (knock‑down carton)",
    stockHint: "Water tank ships empty — volumetric freight applies",
    highlights: ["Honeycomb pad replacements stocked seasonally", "Cover SKU for monsoon storage"],
  },
  {
    sku: "DEMO-EXT-15M-4SK",
    name: "Heavy extension reel — 15m (4 sockets + breaker)",
    category: "Power & cables",
    specs: ["13A breaker button", "Copper flex roll", "Thermal overload", "Wall mount lugs"],
    description:
      "Home/office backup for appliances and lighting rigs—show amp rating + cord length clearly on variant tiles.",
    pricePkr: 4650,
    imageUrl:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80",
    unit: "per reel",
    highlights: ["10m & 20m sisters SKU placeholders", "Industrial drum reels in roadmap"],
  },
  {
    sku: "DEMO-JUI-BLD-800",
    name: "Juicer blender combo — 800W 2‑in‑1",
    category: "Kitchen appliances",
    specs: ["1.5L jug + pulp separator", "2 speeds + pulse", "Safety interlock", "SS blades"],
    description:
      "Breakfast prep hero SKU—demo highlights wattage, jug material, and dishwasher‑safe parts if your vendor confirms.",
    pricePkr: 11200,
    compareAtPkr: 12650,
    imageUrl:
      "https://images.unsplash.com/photo-1570222094114-d054a817e349?auto=format&fit=crop&w=1200&q=80",
    badge: "Kitchen pick",
    unit: "per set",
    stockHint: "Glass jug variant priced separately",
    highlights: ["Smoothie strainer attachment upsell slot", "Spare gasket kits behind counter"],
  },
  {
    sku: "DEMO-DRY-ION-2200",
    name: "Hair dryer — 2200W ionic (cool shot)",
    category: "Personal care",
    specs: ["2 heat / 2 speed", "Concentrator nozzle", "Hang loop", "Overheat fuse"],
    description:
      "Salon‑grade demo tile—call out ions/nozzle kits exactly as your distributor specifies.",
    pricePkr: 6950,
    imageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    unit: "per piece",
    warranty: "6‑month motor coverage (placeholder)",
    highlights: ["Diffuser attachment SKU stub", "Travel mini dryers cross‑sell rail"],
  },
  {
    sku: "DEMO-CLIP-TURBO-LCD",
    name: "Cordless hair clipper — titanium blades + 4 guards",
    category: "Personal care",
    specs: ["LCD battery gauge", "USB‑C charge dock", "Quiet torque motor", "Thumb taper lever"],
    description:
      "Barber/home haircut kit layout—guards, blade oil, and cleaning brush rows fit neatly under specs.",
    pricePkr: 8950,
    compareAtPkr: 9800,
    imageUrl:
      "https://images.unsplash.com/photo-1599351431408-c51f48381ce5?auto=format&fit=crop&w=1200&q=80",
    badge: "Giftable",
    unit: "per kit",
    stockHint: "Zero‑gap blade upgrade mentioned on PDP footnotes",
    highlights: ["Kids-safe rounded tips option", "Travel pouch bundle"],
  },
  {
    sku: "DEMO-SND-DUO-750",
    name: "Sandwich & grill maker — 750W non‑stick plates",
    category: "Kitchen appliances",
    specs: ["Diagonal cut pockets", "Ready lamp + latch lock", "Oil drip channel", "Cool-touch housing"],
    description:
      "Breakfast/snack grid SKU—demo compares plates vs waffle SKU placeholder.",
    pricePkr: 7850,
    imageUrl:
      "https://images.unsplash.com/photo-1585515320310-529814d90671?auto=format&fit=crop&w=1200&q=80",
    unit: "per unit",
    highlights: ["Waffle plate accessory stub", "Recipe QR strip zone"],
  },
  {
    sku: "DEMO-CURL-TAPER-25",
    name: "Curling wand — 25mm ceramic tapered barrel",
    category: "Personal care",
    specs: ["180–210°C dial", "60‑min auto shutoff", "360° swivel cord", "Heat glove included"],
    description:
      "Curly/wavy styling demo—emphasize barrel width + heat zones so shoppers pick the right tool.",
    pricePkr: 5650,
    compareAtPkr: 6400,
    imageUrl:
      "https://images.unsplash.com/photo-1596462500658-711403390530?auto=format&fit=crop&w=1200&q=80",
    badge: "New",
    unit: "per set",
    highlights: ["Heat mat pouch upsell", "Beach‑wave 32mm sister SKU"],
  },
];
