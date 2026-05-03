import Link from "next/link";
import Image from "next/image";
import { getStorefrontPayload } from "@/lib/storefront";

const CONTACT_FALLBACK_PRIMARY = "/20260401_153109.jpg.jpeg";
const CONTACT_FALLBACK_SECOND = "/20260419_185049.jpg.jpeg";

/**
 * Registered Google Business Profile for this shop.
 * Embed uses Google's place feature id so the named listing shows (not only raw coordinates).
 */
const STORE_LOCATION = {
  name: "Al Makkah Electric Traders",
  lat: 31.0658769,
  lng: 72.9439501,
  /** From Maps URL ...1s0x3922f15e62348bcf:0xd4712bb9e23c818e — ties iframe to the Business Profile */
  googlePlaceFeatureRef: "0x3922f15e62348bcf:0xd4712bb9e23c818e",
  googleMapsPlaceUrl:
    "https://www.google.com/maps/place/Al+Makkah+Electric+Traders/@31.0658769,72.9439501,17z/data=!3m1!4b1!4m6!3m5!1s0x3922f15e62348bcf:0xd4712bb9e23c818e!8m2!3d31.0658769!4d72.9439501!16s%2Fg%2F11ynf8lkz5",
} as const;



/** Official `/maps/embed?pb=…` payload — pins the registered Business Profile (not only lat/lng). */
function googleMapsEmbedSrc(lat: number, lng: number, placeFeatureRef: string, placeTitleForEmbed: string) {
  const refSeg = placeFeatureRef.replace(/:/g, "%3A");
  const titleSeg = encodeURIComponent(placeTitleForEmbed);
  const pb =
    `!1m18!1m12!1m3!1d3414.738945679912!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${refSeg}!2s${titleSeg}!5e0!3m2!1sen!2spk!4v1735564800000!5m2!1sen!2spk`;
  return `https://www.google.com/maps/embed?pb=${pb}`;
}

export default async function ContactPage() {
  const storefront = await getStorefrontPayload();
  const CONTACT_STORE_IMAGE = (storefront.contactPrimaryImage ?? "").trim() || CONTACT_FALLBACK_PRIMARY;
  const CONTACT_SECOND_IMAGE = (storefront.contactSecondaryImage ?? "").trim() || CONTACT_FALLBACK_SECOND;

  const deskHours = storefront.supportDeskHours;
  const supportIntro = storefront.supportCommitmentsIntro;
  const escalations = storefront.supportEscalations;

  const mapEmbedSrc = googleMapsEmbedSrc(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    STORE_LOCATION.googlePlaceFeatureRef,
    STORE_LOCATION.name,
  );

  const whatsappCards = [
    {
      label: "Sales desk · Lahore",
      phoneDisplay: "0335‑744‑6353",
      tel: "+923357446353",
      wa: "https://wa.me/923357446353",
      notes: "Quickest channel for quotes, fan finishes, cooler availability, and wattage checks.",
    },
    {
      label: "Dispatch & COD confirmations",
      phoneDisplay: "0326‑715‑3153",
      tel: "+923267153153",
      wa: "https://wa.me/923267153153",
      notes: "Share airway bills, reschedule courier drops, or update quantities mid-flight.",
    },
  ];

  const briefingBullets = [
    "Delivery city + landmark",
    "Desired models / SKUs or photos",
    "Voltage & plug type if unsure",
    "Finishes (fan colour, LED Kelvin, jug material)",
    "Photos of wall brackets or counter space if helpful",
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-8 shadow-sm sm:p-10">
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
          Talk to our sales desk
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">We coordinate COD packs like procurement teammates</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-700">
          Reach out for live pricing, seasonal bundles, or to sanity-check SKUs before big buys. Share lists or photos via WhatsApp—nothing ships until both sides confirm the order.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Explore catalog
          </Link>
          <Link href="/about" className="inline-flex h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-6 text-sm font-semibold text-blue-800 hover:bg-blue-50">
            How we operate
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">WhatsApp-first concierge</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Each channel below routes to humans—not bots—so you can clarify cooler sizing, LED warmth, juicer jars, or phased deliveries across Lahore + nationwide courier corridors.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
              Typical reply &lt; 30 mins · business hours
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {whatsappCards.map((card) => (
              <div key={card.phoneDisplay} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</div>
                <a className="mt-3 block text-2xl font-semibold text-blue-700 hover:text-blue-800" href={`tel:${card.tel}`}>
                  {card.phoneDisplay}
                </a>
                <a className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800" href={card.wa}>
                  Open WhatsApp ↗
                </a>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Email · Purchase orders</div>
          <div className="mt-4 text-sm text-slate-600">
            <a className="font-semibold text-blue-700 hover:text-blue-800" href="mailto:almakkahelectrictraders@gmail.com">
              almakkahelectrictraders@gmail.com
            </a>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">Attach Excel BOMs, site notices, or tax particulars—we reconcile against variant specs before issuing COD confirmations.</p>
          <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-xs leading-relaxed text-blue-900 ring-1 ring-blue-100">
            Heads-up: Email queues spike Fridays—WhatsApp remains fastest when courier cutoff looms.
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">What to prep before you ping</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Providing these datapoints trims ping-pong and helps us pack bulky appliances safely.</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            {briefingBullets.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white p-8">
          <div className="text-sm font-semibold text-slate-900">Support commitments</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{supportIntro}</p>
          <dl className="mt-6 space-y-4 text-sm text-slate-700">
            <div className="flex items-start justify-between gap-4 border-b border-blue-100 pb-4">
              <dt className="text-slate-500">Desk hours</dt>
              <dd className="text-right font-semibold text-slate-900">{deskHours}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Escalations</dt>
              <dd className="text-right font-semibold text-slate-900">{escalations}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100">
              Visit us
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{STORE_LOCATION.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Find us on Google Maps. The map below uses your Business Profile place pin—same listing as when customers search{" "}
              <span className="font-medium text-slate-800">Al Makkah Electric Traders</span> or your shorter profile name (e.g.{" "}
              <span className="font-medium text-slate-800">allmakkah</span>). Open the full Maps page for directions and reviews.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-slate-900">Coordinates</dt>
                <dd className="tabular-nums text-slate-600">
                  {STORE_LOCATION.lat}, {STORE_LOCATION.lng}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-slate-900">Hours</dt>
                <dd className="text-slate-600">
                  {deskHours} (confirm before visiting)
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={STORE_LOCATION.googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Open in Google Maps
              </a>
              <a
                href={STORE_LOCATION.googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-blue-800 hover:bg-blue-50"
              >
                Directions ↗
              </a>
            </div>
          </div>
          <p className="max-w-md rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 lg:text-right">
            COD and phone orders are still confirmed by WhatsApp/call before dispatch. Visiting in person? Message ahead so someone can assist with picks and counter stock.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <Image
              src={CONTACT_STORE_IMAGE}
              alt={`${STORE_LOCATION.name} — store photo`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <Image
              src={CONTACT_SECOND_IMAGE}
              alt={`${STORE_LOCATION.name} — inside store`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
          <div className="relative aspect-[16/10] w-full min-h-[280px]">
            <iframe
              title={`${STORE_LOCATION.name} — Google Maps`}
              src={mapEmbedSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Counter & pickup", body: "Ask for will-call when your order is confirmed—we can stage fans, reels, and small appliances for quick collection.", badge: "In-store" },
            { title: "Nationwide COD", body: "Courier partners by region; tracking shared after dispatch confirmation.", badge: "Delivery" },
            { title: "Parking / access", body: "Use Google Maps directions for the latest routing; busy markets—WhatsApp us if you need a landmark pin.", badge: "Tip" },
          ].map((tile) => (
            <div key={tile.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">{tile.title}</div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100">{tile.badge}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{tile.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
