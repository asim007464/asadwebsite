import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_SHOP_NAME, SITE_SHORT_TAGLINE } from "@/lib/site-brand";
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
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact & map" },
] as const;

function pickSocialIcon(platform: string | undefined, label: string) {
  const key = `${platform ?? ""} ${label}`.toLowerCase();
  if (key.includes("facebook")) return FacebookIcon;
  if (key.includes("linkedin")) return LinkedInIcon;
  if (key.includes("instagram")) return InstagramIcon;
  if (key.includes("youtube")) return YouTubeIcon;
  if (key.includes("pinterest")) return PinterestIcon;
  if (key.includes("twitter") || /\bx\b/.test(key)) return XIcon;
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

function XIcon() {
  return (
    <IconBase>
      <path
        d="M18.6 3H21l-6.7 7.6L22 21h-6.4l-5-6.2L5 21H2.6l7.2-8.2L2 3h6.6l4.5 5.7L18.6 3Zm-1.1 16h1.3L7.9 4.9H6.5L17.5 19Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

function PinterestIcon() {
  return (
    <IconBase>
      <path
        d="M12.1 3C7 3 4 6.4 4 10.6c0 2.6 1.4 5.8 3.7 6.8.3.1.5 0 .6-.3l.3-1.2c.1-.3.1-.4-.2-.7-.7-.8-1.3-2.2-1.3-3.6 0-3.5 2.7-6.9 7.2-6.9 3.9 0 6.7 2.7 6.7 6.4 0 4.3-2.2 7.3-5.1 7.3-1.6 0-2.8-1.3-2.4-3l1-4.1c.3-1.1-.2-2.1-1.3-2.1-1 0-1.8 1-2.1 2.4-.2.7-.3 1.5-.1 2.2l-.9 3.8-.5 2c-.2.9-.1 2.3 0 3.2.1.2.2.3.4.1.6-.7 1.4-2 1.7-3l.5-1.9c.4.7 1.6 1.2 2.9 1.2 3.8 0 6.6-3.5 6.6-8.1C22 6.6 18.4 3 12.1 3Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

function YouTubeIcon() {
  return (
    <IconBase>
      <path
        d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12s.1 3.2.4 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.3-1.6.4-4.8.4-4.8s0-3.2-.4-4.8Z"
        fill="currentColor"
      />
      <path d="M10.2 15V9.3l5.2 2.9-5.2 2.8Z" fill="#0B1220" opacity="0.95" />
    </IconBase>
  );
}

export async function SiteFooter() {
  const storefront = await getStorefrontPayload();
  const socialLinksResolved = storefront.socialLinks.filter((x) => x.url?.trim()?.length && x.label?.trim()?.length);

  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-slate-400">
      <div className="h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgb(96 153 247) 0%, transparent 42%), radial-gradient(circle at 90% 80%, rgb(33 82 209) 0%, transparent 38%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pb-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="group inline-flex max-w-md items-start gap-4 rounded-2xl outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 md:h-[4.25rem] md:w-[4.25rem]">
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
              <span className="min-w-0 pt-0.5">
                <span className="block text-lg font-bold tracking-tight text-white md:text-xl">{SITE_SHOP_NAME}</span>
                <span className="mt-1.5 block text-sm font-medium leading-snug text-blue-300/90">{SITE_SHORT_TAGLINE}</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
              Trusted electrical and appliance sourcing — fans, lighting, kitchen and grooming tools, plus wiring and accessories. Clear specs on every SKU and COD backed by phone confirmation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25">
                COD Pakistan
              </span>
              <span className="rounded-full border border-slate-600/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
                Nationwide dispatch
              </span>
              <span className="rounded-full border border-slate-600/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
                Specs per variant
              </span>
            </div>

            <div className="mt-8">
              <FootHeading>Social</FootHeading>
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinksResolved.map((s) => {
                  const Icon = pickSocialIcon(s.platform, s.label);
                  return (
                    <a
                      key={`${s.label}-${s.url}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/60 text-slate-200 transition hover:border-blue-400/50 hover:bg-slate-900 hover:text-white"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">Links editable in Admin → Site & payments (social).</p>
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
            <div className="mt-5 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm ring-1 ring-white/5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/95">WhatsApp fastest</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Quotes, finishes, stock checks — we reply on WhatsApp during desk hours.</p>
              <a
                href="https://wa.me/923357446353"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#25D366] text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-[#20BD5A]"
              >
                Message sales · 0335‑744‑6353
              </a>
              <Link
                href="/contact"
                className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-slate-600/90 bg-slate-800/50 text-sm font-semibold text-white transition hover:border-blue-500/50 hover:bg-slate-800"
              >
                Directions & full contact
              </Link>

              <div className="my-5 h-px bg-slate-700/80" />

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hours · PKT</dt>
                  <dd className="mt-1 font-semibold text-slate-100">Mon–Sat · 10:00–19:00</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sales</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <a className="font-semibold text-blue-400 hover:text-blue-300" href="tel:+923357446353">
                      0335‑744‑6353
                    </a>
                    <span className="text-slate-600">·</span>
                    <a
                      className="font-semibold text-emerald-400 hover:text-emerald-300"
                      href="https://wa.me/923357446353"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Dispatch</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <a className="font-semibold text-blue-400 hover:text-blue-300" href="tel:+923267153153">
                      0326‑715‑3153
                    </a>
                    <span className="text-slate-600">·</span>
                    <a
                      className="font-semibold text-emerald-400 hover:text-emerald-300"
                      href="https://wa.me/923267153153"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </dd>
                </div>
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

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
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
