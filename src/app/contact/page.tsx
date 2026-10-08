import Link from "next/link";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { googleMapsEmbedSrc, resolveStoreLocation } from "@/lib/store-location";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const CONTACT_FALLBACK_PRIMARY = "/20260401_153109.jpg.jpeg";
const CONTACT_FALLBACK_SECOND = "/20260419_185049.jpg.jpeg";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4.5h3.2l1.1 3.3-1.7 1.2a12.5 12.5 0 0 0 4.9 4.9l1.2-1.7 3.3 1.1v3.2a1.8 1.8 0 0 1-1.9 1.8A15.7 15.7 0 0 1 4.7 6.4 1.8 1.8 0 0 1 6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2.1a9.8 9.8 0 0 0-8.4 14.8L2.2 21.9l5.2-1.36A9.8 9.8 0 1 0 12.04 2.1Zm0 17.8a8 8 0 0 1-4.08-1.12l-.29-.17-3.07.8.82-3-.19-.31a8 8 0 1 1 6.81 3.8Zm4.4-5.98c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default async function ContactPage() {
  const storefront = await getStorefrontPayload();
  const CONTACT_STORE_IMAGE = (storefront.contactPrimaryImage ?? "").trim() || CONTACT_FALLBACK_PRIMARY;
  const CONTACT_SECOND_IMAGE = (storefront.contactSecondaryImage ?? "").trim() || CONTACT_FALLBACK_SECOND;
  const store = resolveStoreLocation(storefront);
  const mapEmbedSrc = googleMapsEmbedSrc(store.lat, store.lng, store.googlePlaceFeatureRef, store.name);
  const deskHours = storefront.supportDeskHours?.trim() || "";
  const email = storefront.contactEmail?.trim() || "";

  const cards = [
    {
      key: "sales",
      icon: "phone" as const,
      label: storefront.contactChannel1Label?.trim() || "Sales desk",
      value: storefront.contactChannel1Display?.trim() || "",
      href: storefront.contactChannel1Tel?.trim()
        ? `tel:${storefront.contactChannel1Tel.trim()}`
        : undefined,
      wa: storefront.contactChannel1Wa?.trim() || undefined,
      note: storefront.contactChannel1Notes?.trim() || "",
      tone: "blue" as const,
    },
    {
      key: "dispatch",
      icon: "phone" as const,
      label: storefront.contactChannel2Label?.trim() || "Dispatch",
      value: storefront.contactChannel2Display?.trim() || "",
      href: storefront.contactChannel2Tel?.trim()
        ? `tel:${storefront.contactChannel2Tel.trim()}`
        : undefined,
      wa: storefront.contactChannel2Wa?.trim() || undefined,
      note: storefront.contactChannel2Notes?.trim() || "",
      tone: "emerald" as const,
    },
    {
      key: "email",
      icon: "mail" as const,
      label: "Email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
      wa: undefined,
      note: "",
      tone: "sky" as const,
    },
    {
      key: "hours",
      icon: "clock" as const,
      label: "Desk hours",
      value: deskHours,
      href: undefined,
      wa: undefined,
      note: store.name,
      tone: "slate" as const,
    },
  ];

  const toneIcon: Record<(typeof cards)[number]["tone"], string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
      {/* Hero — keep short */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
          Contact us
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {storefront.contactPageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{storefront.contactPageLead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Explore catalog
          </Link>
          <Link
            href="/about"
            className="inline-flex h-11 items-center justify-center rounded-full border border-blue-200 bg-white px-6 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            About us
          </Link>
        </div>
      </div>

      {/* Four contact columns */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${toneIcon[card.tone]}`}>
              {card.icon === "phone" ? <PhoneIcon className="h-5 w-5" /> : null}
              {card.icon === "mail" ? <MailIcon className="h-5 w-5" /> : null}
              {card.icon === "clock" ? <ClockIcon className="h-5 w-5" /> : null}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</div>
            {card.href && card.value ? (
              <a
                href={card.href}
                className="mt-2 break-all text-base font-semibold text-slate-900 hover:text-blue-700 sm:text-[15px]"
              >
                {card.value}
              </a>
            ) : (
              <div className="mt-2 text-base font-semibold text-slate-900 sm:text-[15px]">{card.value || "—"}</div>
            )}
            {card.note ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.note}</p> : null}
            {card.wa ? (
              <a
                href={card.wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {/* Photos + map */}
      <section id="locations" className="mt-8 scroll-mt-[calc(var(--site-header-height)+1rem)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <MapPinIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">{store.name}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {store.lat.toFixed(5)}, {store.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <a
            href={store.googleMapsPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <SafeRemoteImage
              src={CONTACT_STORE_IMAGE}
              alt={`${store.name} — store photo`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <SafeRemoteImage
              src={CONTACT_SECOND_IMAGE}
              alt={`${store.name} — inside store`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="relative aspect-[16/10] w-full min-h-[260px] sm:min-h-[320px]">
            <iframe
              title={`${store.name} — Google Maps`}
              src={mapEmbedSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
}
