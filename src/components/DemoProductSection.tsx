import Link from "next/link";
import type { DemoProduct } from "@/lib/demo-products";
import { formatPKR } from "@/lib/money";
import { ProductCardMedia } from "@/components/ProductCardMedia";

export function DemoProductSection({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: DemoProduct[];
}) {
  return (
    <section className="mt-12 rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            {eyebrow}
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
          View live catalog →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {products.map((p) => (
          <article
            key={p.sku}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative">
              <ProductCardMedia imageUrl={p.imageUrl} alt={p.name} />
              {p.badge ? (
                <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-blue-900 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                  {p.badge}
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{p.category}</div>
              <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900">{p.name}</h3>
              <div className="mt-1 text-xs font-medium text-slate-500">SKU: {p.sku}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.unit ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                    {p.unit}
                  </span>
                ) : null}
                {p.origin ? (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 ring-1 ring-blue-100">
                    {p.origin}
                  </span>
                ) : null}
                {p.warranty ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    {p.warranty}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.description}</p>
              {p.stockHint ? <p className="mt-2 text-xs font-medium text-slate-500">{p.stockHint}</p> : null}
              {p.highlights?.length ? (
                <ul className="mt-3 space-y-1 text-xs leading-snug text-slate-600">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-0.5 text-blue-600">▸</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                {p.specs.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                <div className="text-lg font-semibold text-slate-900">{formatPKR(p.pricePkr)}</div>
                {p.compareAtPkr ? (
                  <div className="text-sm text-slate-400 line-through">{formatPKR(p.compareAtPkr)}</div>
                ) : null}
                <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                  Demo only — not purchasable
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
