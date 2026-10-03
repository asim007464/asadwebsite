function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Base shimmer block — use for any placeholder shape. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/85 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-none rounded-t-2xl" />
      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-3 pt-2.5 sm:px-3.5">
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-1 h-5 w-20" />
        <Skeleton className="mt-auto h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="pb-16" role="status" aria-busy="true" aria-label="Loading homepage">
      <span className="sr-only">Loading…</span>
      {/* Hero */}
      <div className="relative left-1/2 w-[min(100dvw,100%)] max-w-none -translate-x-1/2">
        <Skeleton className="h-[min(52vw,22rem)] w-full rounded-none sm:h-[min(42vw,28rem)] md:h-[32rem]" />
      </div>

      <div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:mt-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl sm:h-24" />
          ))}
        </div>

        {/* Promo strip */}
        <Skeleton className="mt-10 h-40 w-full rounded-2xl sm:mt-12 sm:h-56 md:h-64" />

        {/* Featured heading + rail */}
        <div className="mt-12 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="w-[min(70vw,16rem)] shrink-0 sm:w-64">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-14 space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Second product section */}
        <div className="mt-14 space-y-4">
          <Skeleton className="h-8 w-40" />
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10" role="status" aria-busy="true" aria-label="Loading products">
      <span className="sr-only">Loading products…</span>
      <Skeleton className="h-9 w-28" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_1fr]">
        <aside className="hidden space-y-4 md:block">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </aside>
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10" role="status" aria-busy="true" aria-label="Loading product">
      <span className="sr-only">Loading product…</span>
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-xl sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-[85%]" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full max-w-xs rounded-xl" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function ContentPageSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10" role="status" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
      <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
    </main>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-16" role="status" aria-busy="true" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <Skeleton className="mx-auto h-8 w-40" />
      <Skeleton className="mx-auto mt-2 h-4 w-56" />
      <div className="mt-8 space-y-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="mt-2 h-12 w-full rounded-2xl" />
      </div>
    </main>
  );
}

export function CartPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10" role="status" aria-busy="true" aria-label="Loading cart">
      <span className="sr-only">Loading cart…</span>
      <Skeleton className="h-9 w-28" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-auto h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-4 h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10" role="status" aria-busy="true" aria-label="Loading checkout">
      <span className="sr-only">Loading checkout…</span>
      <Skeleton className="h-9 w-36" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
          <Skeleton className="mt-4 h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading admin">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
