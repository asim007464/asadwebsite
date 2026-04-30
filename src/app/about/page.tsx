import Link from "next/link";
import Image from "next/image";
import { SITE_SHOP_NAME } from "@/lib/site-brand";

const ABOUT_STORE_IMAGE = "/20260401_153109.jpg.jpeg";
const ABOUT_SECOND_IMAGE = "/20260419_185049.jpg.jpeg";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 10%, rgb(37 99 235) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgb(96 165 250) 0%, transparent 45%)",
          }}
          aria-hidden
        />

        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
              About {SITE_SHOP_NAME}
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.55rem] lg:leading-[1.15]">
              Home appliances & electrical accessories for everyday Pakistan households
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              {SITE_SHOP_NAME} is built for fans, LED lighting, heaters, coolers, kitchen helpers, grooming tools, and power accessories — organized by
              category with variant‑level specs and COD checkout. Every listing should spell out wattage, finishes, and what’s in the box before you
              order.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Genuine brands", "COD with confirmation", "Nationwide dispatch", "Specs per variant"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Browse catalog
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-7 text-sm font-semibold text-blue-800 hover:bg-blue-50"
              >
                Contact sales
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner">
              <div className="relative aspect-[16/11]">
                <Image
                  src={ABOUT_STORE_IMAGE}
                  alt={`${SITE_SHOP_NAME} — storefront`}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 40vw"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-950/5 to-transparent" />
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 w-[62%] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl sm:-left-6 sm:w-[58%]">
              <div className="relative aspect-[16/11]">
                <Image
                  src={ABOUT_SECOND_IMAGE}
                  alt={`${SITE_SHOP_NAME} — in-store display`}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 70vw, (max-width:1024px) 35vw, 28vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-950/0 to-transparent" />
              </div>
            </div>

            <div className="pointer-events-none absolute -right-4 -top-4 hidden h-24 w-24 rounded-3xl bg-blue-600/10 ring-1 ring-blue-200 sm:block" aria-hidden />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Genuine products</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">Brand-backed SKUs with documented specs—ideal when warranties or voltage compatibility matter.</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">COD-first</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">Cash on delivery with human confirmation before goods leave the warehouse.</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Fast support</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">Guidance on watt limits, plug types, cooler pads, clipper guards, and accessory pairing.</div>
        </div>
      </div>

      <section className="mt-10 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">How we work with shoppers</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Whether you are furnishing a new flat or restocking a shop shelf, the flow stays simple: shortlist online → confirm specs → receive picking confirmation → pay on delivery.
            </p>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-900 ring-1 ring-blue-100">Straightforward onboarding</div>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Share your shopping list",
              body: "Tell us models, colours, wattages, or bundle counts—we mirror that structure in your cart summary.",
            },
            {
              step: "02",
              title: "Validate variants",
              body: "Voltage, plug style, remote inclusion, and jug materials are double-checked before dispatch paperwork prints.",
            },
            {
              step: "03",
              title: "COD handoff",
              body: "Courier-ready packs labeled clearly so drivers know when an item needs upright orientation or extra padding.",
            },
          ].map((item) => (
            <li key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.step}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/70 via-white to-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Team</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Meet our team</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              The people behind product sourcing, variant checks, and COD confirmation. Replace names/roles with your real staff anytime.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Talk to us
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Asad", role: "Owner & procurement", note: "Sourcing, pricing, vendor coordination.", initials: "AS" },
            { name: "Hassan", role: "Sales & WhatsApp support", note: "Spec checks, COD confirmation.", initials: "HA" },
            { name: "Amina", role: "Dispatch & packing", note: "Variant labeling, fragile handling.", initials: "AK" },
            { name: "Bilal", role: "Catalog & listings", note: "Photos, attributes, SKU hygiene.", initials: "BM" },
          ].map((m) => (
            <div key={m.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-800 ring-1 ring-blue-100">
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{m.name}</div>
                  <div className="text-xs font-medium text-slate-500">{m.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{m.note}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
