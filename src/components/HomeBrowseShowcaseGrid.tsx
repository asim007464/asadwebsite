import Link from "next/link";
import { ProductGridCard } from "@/components/ProductGridCard";
import type { Category, ProductListing } from "@/lib/store-types";

export function HomeBrowseShowcaseGrid({
  category,
  products,
  sectionTitle,
}: {
  category: Category;
  products: ProductListing[];
  sectionTitle?: string;
}) {
  const title = sectionTitle?.trim() || category.name;
  const categoryHref = `/products?category=${encodeURIComponent(category.slug)}`;

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">Hand-picked from {category.name} — tap a product for details.</p>
        </div>
        <Link href={categoryHref} className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
          View all
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 items-start gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-4">
        {products.map((p) => (
          <ProductGridCard key={p.id} product={p} sizes="(max-width:640px) 50vw, 20vw" />
        ))}
      </div>
    </>
  );
}
