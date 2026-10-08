"use client";

import Link from "next/link";
import type { StorefrontFaqItem } from "@/lib/storefront";

const DEFAULT_FAQS: StorefrontFaqItem[] = [
  {
    q: "Do you offer delivery services?",
    a: "Yes — we offer fast and reliable delivery within our service area. Delivery options and charges may vary depending on your location and order size.",
  },
  {
    q: "Are your products original and guaranteed?",
    a: "Absolutely. We deal only in genuine and trusted brands, ensuring quality, durability, and performance. Many products also come with manufacturer warranties.",
  },
  {
    q: "Can I place bulk or wholesale orders?",
    a: "Yes — we handle both retail and wholesale supply. For bulk orders, contact us directly to get the best pricing and customized deals.",
  },
  {
    q: "How can I contact you for inquiries or support?",
    a: "You can reach us via phone, WhatsApp, or email. Visit our Contact Us page for full details, and our team will assist you promptly.",
  },
  {
    q: "Do you confirm orders before dispatch?",
    a: "Yes — we confirm orders by phone or WhatsApp before dispatch to ensure the right variant, specs, and delivery details.",
  },
];

export function FAQSection({
  eyebrow,
  heading,
  lead,
  contactLabel,
  contactHref,
  faqs,
}: {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  contactLabel?: string;
  contactHref?: string;
  faqs?: readonly StorefrontFaqItem[];
}) {
  const items = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;
  const eyebrowText = eyebrow?.trim() || "FAQs";
  const headingText = heading?.trim() || "Frequently asked questions";
  const leadText = lead?.trim() || "Quick answers about delivery, authenticity, wholesale, and support.";
  const linkLabel = contactLabel?.trim() || "Contact us →";
  const linkHref = contactHref?.trim() || "/contact";

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">{eyebrowText}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{headingText}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{leadText}</p>
        </div>
        <Link href={linkHref} className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
          {linkLabel}
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-200"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
              <span className="text-sm font-semibold text-slate-900 sm:text-[15px]">{f.q}</span>
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition group-open:bg-blue-50 group-open:text-blue-800">
                <span className="block leading-none group-open:hidden">+</span>
                <span className="hidden leading-none group-open:block">−</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
