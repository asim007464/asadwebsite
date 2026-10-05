import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_SHOP_NAME } from "@/lib/site-brand";
import { resolveStoreLocation } from "@/lib/store-location";
import { getStorefrontPayload } from "@/lib/storefront";

const shopLinks = [
  { href: "/products", label: "All products" },
  { href: "/cart", label: "Cart" },
  { href: "/products?category=fans-cooling", label: "Fans & cooling" },
  { href: "/products?category=lighting-leds", label: "Lighting & LEDs" },
  { href: "/products?category=heaters", label: "Heaters" },
  { href: "/products?category=kitchen-appliances", label: "Kitchen" },
  { href: "/products?category=personal-care", label: "Personal care" },
  { href: "/products?category=power-cables", label: "Power & cables" },
  { href: "/products?category=breakers-protection", label: "Breakers & protection" },
  { href: "/products?category=conduits-accessories", label: "Conduits & accessories" },
  { href: "/products?category=switches-sockets", label: "Switches & sockets" },
  { href: "/products?category=wires-cables", label: "Wires & cables" },
] as const;

const companyLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
] as const;

function isRemovedSocial(platform: string | undefined, label: string) {
  const key = `${platform ?? ""} ${label}`.toLowerCase();
  return (
    key.includes("youtube") ||
    key.includes("twitter") ||
    key.includes("pinterest") ||
    /\bx\b/.test(key)
  );
}

function pickSocialIcon(platform: string | undefined, label: string) {
  const key = `${platform ?? ""} ${label}`.toLowerCase();
  if (key.includes("facebook")) return FacebookIcon;
  if (key.includes("linkedin")) return LinkedInIcon;
  if (key.includes("instagram")) return InstagramIcon;
  if (key.includes("tiktok")) return TikTokIcon;
  return LinkedInIcon;
}

function FootHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
      <span className="h-px w-6 bg-blue-500/80" aria-hidden />
      {children}
    </h2>
  );
}

function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      {children}
    </svg>
  );
}

function FacebookIcon() {
  return (
    <IconBase>
      <path
        d="M14 8.5V7.3c0-.7.3-1.1 1.1-1.1H17V3h-2.3C12.6 3 11 4.6 11 6.7v1.8H9v3h2V21h3v-9.5h2.2l.3-3H14Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

function LinkedInIcon() {
  return (
    <IconBase>
      <path
        d="M6.6 7.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM5.2 21h2.8V9.2H5.2V21ZM10.2 9.2V21H13v-6.2c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4V21H20V14.2c0-3.3-.7-5.8-4.6-5.8-1.9 0-3.1 1-3.6 1.9h-.1V9.2h-2.6Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

function InstagramIcon() {
  return (
    <IconBase>
      <path
        d="M7.6 3h8.8A4.6 4.6 0 0 1 21 7.6v8.8A4.6 4.6 0 0 1 16.4 21H7.6A4.6 4.6 0 0 1 3 16.4V7.6A4.6 4.6 0 0 1 7.6 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 16.2A4.2 4.2 0 1 0 12 7.8a4.2 4.2 0 0 0 0 8.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17.3 6.7h.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </IconBase>
  );
}

function TikTokIcon() {
  return (
    <IconBase>
      <path
        d="M14.5 4c.4 2.2 1.8 3.8 3.9 4.1v2.4c-1.3-.05-2.5-.45-3.5-1.15v5.85a5.1 5.1 0 1 1-5.1-5.1c.28 0 .55.03.81.08v2.55a2.55 2.55 0 1 0 1.79 2.44V4h2.1Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

export async function SiteFooter() {
  const storefront = await getStorefrontPayload();
  const store = resolveStoreLocation(storefront);
  const socialLinksResolved = storefront.socialLinks
    .filter((x) => x.url?.trim()?.length && x.label?.trim()?.length)
    .filter((x) => !isRemovedSocial(x.platform, x.label));

  const hasTikTok = socialLinksResolved.some((x) =>
    `${x.platform ?? ""} ${x.label}`.toLowerCase().includes("tiktok"),
  );
  const socialForFooter = hasTikTok
    ? socialLinksResolved
    : (() => {
        const next = [...socialLinksResolved];
        const igIdx = next.findIndex((x) => `${x.platform ?? ""} ${x.label}`.toLowerCase().includes("instagram"));
        const tiktok = {
          label: "TikTok",
          url: "https://www.tiktok.com/",
          platform: "tiktok",
        };
        if (igIdx >= 0) next.splice(igIdx + 1, 0, tiktok);
        else next.push(tiktok);
        return next;
      })();

  return (
    <footer className="relative mt-auto overflow-hidden bg-black text-slate-400">
      <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 opacity-80" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgb(30 58 138) 0%, transparent 42%), radial-gradient(circle at 90% 80%, rgb(30 64 175) 0%, transparent 38%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pb-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Brand */}
          <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
            <Link
              href="/"
              className="group flex max-w-md flex-col items-center gap-3 rounded-2xl outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:flex-row sm:items-center sm:gap-4 lg:items-start"
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white md:h-[4.25rem] md:w-[4.25rem]">
                <Image
                  src="/website-logo.jpeg"
                  alt=""
                  width={192}
                  height={192}
                  role="presentation"
                  className="h-[85%] w-[85%] object-contain"
                  loading="lazy"
                />
              </span>
              <span className="min-w-0 pt-0 sm:pt-0.5">
                <span className="block text-lg font-bold tracking-tight text-white md:text-xl">{SITE_SHOP_NAME}</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400 lg:mx-0">
              Trusted electrical and appliance sourcing — fans, lighting, kitchen and grooming tools, plus wiring and accessories. Clear specs on every SKU and COD backed by phone confirmation.
            </p>

            <div className="mt-8 flex w-full flex-col items-center lg:items-start">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {socialForFooter.map((s) => {
                  const Icon = pickSocialIcon(s.platform, s.label);
                  return (
                    <a
                      key={`${s.label}-${s.url}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-black text-slate-200 transition hover:border-blue-500/40 hover:bg-zinc-950 hover:text-white"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Browse + company */}
          <div className="lg:col-span-4">
            <FootHeading>Browse</FootHeading>
            <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5" aria-label="Footer shop links">
              {shopLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm font-medium text-slate-300 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-10">
              <FootHeading>Company</FootHeading>
              <ul className="mt-5 space-y-2.5">
                {companyLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm font-semibold text-slate-300 transition hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <FootHeading>Contact</FootHeading>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-black p-6 shadow-2xl shadow-black/50 ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/95">WhatsApp fastest</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Quotes, finishes, stock checks — we reply on WhatsApp during desk hours.</p>
              <a
                href={storefront.contactChannel1Wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#25D366] text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-[#20BD5A]"
              >
                Message sales · {storefront.contactChannel1Display}
              </a>
              <div className="my-5 h-px bg-slate-900" />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Locations</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{store.name}</p>
                <div className="mt-3">
                  <a
                    href={store.googleMapsPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-black text-center text-xs font-semibold text-white transition hover:border-blue-500/40 hover:bg-zinc-950"
                  >
                    Open in Maps
                  </a>
                </div>
                <Link
                  href="/contact#locations"
                  className="mt-2 flex h-9 w-full items-center justify-center rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Store photos
                </Link>
              </div>

              <div className="my-5 h-px bg-slate-900" />

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                  <dd className="mt-1">
                    <a
                      className="break-all font-semibold text-blue-400 hover:text-blue-300"
                      href="mailto:almakkahelectrictraders@gmail.com"
                    >
                      almakkahelectrictraders@gmail.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-900 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} <span className="font-semibold text-slate-300">{SITE_SHOP_NAME}</span>
            <span className="text-slate-600"> · </span>
            <span>All rights reserved.</span>
          </p>
          <p className="max-w-lg text-xs leading-relaxed text-slate-500 sm:text-right sm:text-sm">
            Pricing and availability are confirmed before dispatch. Returns are handled case‑by‑case after order verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
