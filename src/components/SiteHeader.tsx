"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cartSubtotal, readCart } from "@/lib/cart";
import { formatPKR } from "@/lib/money";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SITE_SHOP_NAME, SITE_SHORT_TAGLINE } from "@/lib/site-brand";

type Category = { id: string; name: string; slug: string };
type ProductSuggest = { id: string; name: string; slug: string; image_url: string | null };

function CartIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7 7h14l-1.5 9h-11L7 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 7 6 3H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="none">
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="8.5" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16.8 16.8 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState<ProductSuggest[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const searchSeq = useRef(0);

  useEffect(() => {
    const sync = () => {
      const items = readCart();
      setCount(items.reduce((s, it) => s + it.quantity, 0));
      setSubtotal(cartSubtotal(items));
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.from("categories").select("id,name,slug").order("name");
        if (!cancelled && data) setCategories(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (catRef.current?.contains(target)) return;
      if (accountRef.current?.contains(target)) return;
      if (searchWrapRef.current?.contains(target)) return;
      setCatOpen(false);
      setAccountOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setActiveIdx(-1);
  }, [pathname]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setSearchProducts([]);
      setSearchLoading(false);
      return;
    }
    const t = window.setTimeout(async () => {
      const mySeq = ++searchSeq.current;
      setSearchLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("product_listings")
          .select("id,name,slug,image_url")
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .order("name")
          .limit(6);
        if (searchSeq.current !== mySeq) return;
        setSearchProducts(((data as ProductSuggest[] | null) ?? []) as ProductSuggest[]);
      } catch {
        if (searchSeq.current === mySeq) setSearchProducts([]);
      } finally {
        if (searchSeq.current === mySeq) setSearchLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [search]);

  const searchCats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)).slice(0, 6);
  }, [categories, search]);

  const suggestions = useMemo(() => {
    const list: { kind: "product" | "category"; id: string; label: string; href: string }[] = [];
    for (const p of searchProducts) list.push({ kind: "product", id: p.id, label: p.name, href: `/product/${p.slug}` });
    for (const c of searchCats) list.push({ kind: "category", id: c.id, label: c.name, href: `/products?category=${encodeURIComponent(c.slug)}` });
    return list.slice(0, 10);
  }, [searchProducts, searchCats]);

  const submitSearch = useMemo(
    () => () => {
      const q = search.trim();
      if (!q) return;
      setSearchOpen(false);
      setMobileOpen(false);
      router.push(`/products?q=${encodeURIComponent(q)}`);
    },
    [router, search],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setMobileCatOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cartAriaLabel = useMemo(() => {
    if (count <= 0) return "Shopping cart, empty — save items here";
    return `Shopping cart, ${count} items, subtotal ${formatPKR(subtotal)}`;
  }, [count, subtotal]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileCatOpen(false);
    setSearchOpen(false);
  };

  const linkBase =
    "rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  const linkInactive = "text-slate-600 hover:bg-white hover:text-blue-800 hover:shadow-sm";

  const linkActive = "bg-white text-blue-800 shadow-sm ring-1 ring-slate-200/90";

  const isProductsActive = pathname === "/products" || pathname.startsWith("/product/");
  const isAboutActive = pathname === "/about";
  const isContactActive = pathname === "/contact";
  const isLoginActive = pathname === "/login";
  const isRegisterActive = pathname === "/register";
  const isForgotActive = pathname === "/forgot-password";

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex min-h-[3.5rem] w-full max-w-6xl items-center justify-between gap-4 px-4 py-2 md:min-h-[4rem] md:py-2.5 lg:px-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 shrink items-center gap-2 rounded-2xl py-0.5 font-semibold tracking-tight text-slate-900 transition-opacity hover:opacity-90 sm:gap-3.5 lg:flex-none lg:shrink-0"
        >
          {!logoError ? (
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center md:h-[4.25rem] md:w-[4.25rem]">
              <Image
                src="/logo.png"
                alt={`${SITE_SHOP_NAME} logo`}
                width={192}
                height={192}
                className="h-full w-full object-contain object-center"
                onError={() => setLogoError(true)}
                priority
              />
            </span>
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white md:h-[4.25rem] md:w-[4.25rem] md:text-base">
              AM
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-bold leading-snug text-slate-900 sm:text-[15px] md:text-lg md:leading-tight">
              {SITE_SHOP_NAME}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium leading-snug text-slate-500 sm:block">
              {SITE_SHORT_TAGLINE}
            </span>
          </span>
        </Link>

        {/* Desktop search: right after logo */}
        <div className="relative hidden flex-1 lg:block max-w-[44rem]" ref={searchWrapRef}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="relative"
          >
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                setSearchOpen(v.trim().length >= 2);
                setActiveIdx(-1);
              }}
              onFocus={() => setSearchOpen(search.trim().length >= 2)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setActiveIdx(-1);
                  return;
                }
                if (!searchOpen || suggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && activeIdx >= 0) {
                  e.preventDefault();
                  const s = suggestions[activeIdx];
                  setSearchOpen(false);
                  setMobileOpen(false);
                  router.push(s.href);
                }
              }}
              placeholder="Search here"
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-9 pr-12 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Go
            </button>
          </form>

          {searchOpen ? (
            <div className="absolute left-0 right-0 z-50 mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
              <div className="p-3">
                {searchLoading ? (
                  <div className="rounded-xl px-3 py-3 text-sm text-slate-600">Searching…</div>
                ) : suggestions.length === 0 ? (
                  <div className="rounded-xl px-3 py-3 text-sm text-slate-600">No matches. Press Enter to search all.</div>
                ) : (
                  suggestions.map((s, i) => (
                    <button
                      key={`${s.kind}-${s.id}`}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                        i === activeIdx ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-blue-50 hover:text-blue-800",
                      )}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => {
                        setSearchOpen(false);
                        setMobileOpen(false);
                        router.push(s.href);
                      }}
                    >
                      <span className="min-w-0 truncate">{s.label}</span>
                      <span className="ml-3 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                        {s.kind === "product" ? "Product" : "Category"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-0.5 rounded-full border border-slate-200/90 bg-slate-100/70 p-1 shadow-inner">
            <Link href="/products" className={cn(linkBase, isProductsActive ? linkActive : linkInactive)}>
              Shop
            </Link>

            <div className="relative" ref={catRef}>
              <button
                type="button"
                aria-expanded={catOpen}
                onClick={() => {
                  setCatOpen((v) => !v);
                  setAccountOpen(false);
                }}
                className={cn(
                  linkBase,
                  "inline-flex items-center gap-1 pr-3",
                  catOpen ? linkActive : linkInactive,
                )}
              >
                Categories
                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", catOpen && "rotate-180 text-blue-700")} />
              </button>
              {catOpen ? (
                <div className="absolute left-0 z-40 mt-3 w-[34rem] origin-top-left overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 to-white px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700/80">Browse</div>
                    <div className="mt-0.5 text-sm font-bold text-slate-900">Categories</div>
                  </div>
                  <div className="p-2">
                    {categories.length === 0 ? (
                      <div className="rounded-xl px-3 py-3 text-sm text-slate-600">No categories yet.</div>
                    ) : (
                      <div className="grid grid-flow-col grid-rows-5 gap-1.5">
                        {categories.slice(0, 10).map((c) => (
                          <Link
                            key={c.id}
                            href={`/products?category=${encodeURIComponent(c.slug)}`}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-blue-800"
                            onClick={() => setCatOpen(false)}
                          >
                            {c.name}
                          </Link>
                        ))}
                        {categories.length > 10 ? (
                          <Link
                            href="/products"
                            className="col-span-full mt-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                            onClick={() => setCatOpen(false)}
                          >
                            View all categories →
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <Link href="/about" className={cn(linkBase, isAboutActive ? linkActive : linkInactive)}>
              About
            </Link>
            <Link href="/contact" className={cn(linkBase, isContactActive ? linkActive : linkInactive)}>
              Contact
            </Link>
          </div>

          <div className="relative ml-1" ref={accountRef}>
            <button
              type="button"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => {
                setAccountOpen((v) => !v);
                setCatOpen(false);
              }}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                accountOpen || isLoginActive || isRegisterActive || isForgotActive
                  ? "border-blue-200 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
                  : "",
              )}
            >
              <ProfileIcon className="h-5 w-5 shrink-0" />
              <span className="sr-only">Account menu</span>
            </button>
            {accountOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-40 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-100"
              >
                <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 to-white px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700/80">Account</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900">Customer access</div>
                </div>
                <div className="p-2">
                  <Link
                    href="/register"
                    role="menuitem"
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-800",
                      isRegisterActive ? "bg-blue-50 text-blue-900" : "text-slate-800",
                    )}
                    onClick={() => setAccountOpen(false)}
                  >
                    Register
                  </Link>
                  <Link
                    href="/login"
                    role="menuitem"
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-800",
                      isLoginActive ? "bg-blue-50 text-blue-900" : "text-slate-800",
                    )}
                    onClick={() => setAccountOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/forgot-password"
                    role="menuitem"
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-800",
                      isForgotActive ? "bg-blue-50 text-blue-900" : "text-slate-800",
                    )}
                    onClick={() => setAccountOpen(false)}
                  >
                    Forgot password
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/cart"
            aria-label={cartAriaLabel}
            className="ml-1 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <CartIcon className="h-[1.125rem] w-[1.125rem] shrink-0 text-white" />
            <span className="hidden lg:inline">Cart</span>
            <span
              className={cn(
                "flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums",
                count > 0 ? "bg-white text-blue-700" : "bg-white/20 text-white ring-1 ring-white/30",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
            {count > 0 ? (
              <span className="hidden border-l border-white/30 pl-2 text-xs font-semibold text-white/95 lg:inline">
                {formatPKR(subtotal)}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            href="/login"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 active:scale-[0.98]"
            aria-label="Account — sign in"
          >
            <ProfileIcon className="h-[1.25rem] w-[1.25rem]" />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98]"
            aria-label={cartAriaLabel}
          >
            <span className="sr-only">{cartAriaLabel}</span>
            <CartIcon className="h-[1.15rem] w-[1.15rem]" />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-0.5 text-[10px] font-bold tabular-nums ring-2 ring-white",
                count > 0 ? "bg-amber-400 text-slate-900" : "bg-white/90 text-slate-700",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          </Link>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div
            id="mobile-nav"
            className="fixed inset-x-3 top-[calc(var(--site-header-height)_+_0.375rem)] z-50 max-h-[min(78vh,calc(100dvh_-_var(--site-header-height)_-_1rem))] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)] lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Menu</div>
              <div className="mt-1 text-lg font-bold text-slate-900">Navigate</div>
            </div>
            <div className="space-y-1 p-3">
              <Link
                href="/products"
                className={cn(
                  "block rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition",
                  isProductsActive ? "bg-blue-50 text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-slate-50",
                )}
                onClick={closeMobile}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className={cn(
                  "block rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition",
                  isAboutActive ? "bg-blue-50 text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-slate-50",
                )}
                onClick={closeMobile}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "block rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition",
                  isContactActive ? "bg-blue-50 text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-slate-50",
                )}
                onClick={closeMobile}
              >
                Contact
              </Link>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Account</div>
                <div className="mt-3 grid gap-1">
                  <Link
                    href="/register"
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
                      isRegisterActive ? "bg-white text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-white",
                    )}
                    onClick={closeMobile}
                  >
                    Register
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
                      isLoginActive ? "bg-white text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-white",
                    )}
                    onClick={closeMobile}
                  >
                    Login
                  </Link>
                  <Link
                    href="/forgot-password"
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
                      isForgotActive ? "bg-white text-blue-900 ring-1 ring-blue-100" : "text-slate-800 hover:bg-white",
                    )}
                    onClick={closeMobile}
                  >
                    Forgot password
                  </Link>
                </div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
                aria-expanded={mobileCatOpen}
                onClick={() => setMobileCatOpen((v) => !v)}
              >
                Categories
                <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", mobileCatOpen && "rotate-180")} />
              </button>
              {mobileCatOpen ? (
                <div className="ml-3 space-y-0.5 border-l-2 border-blue-200 pl-4">
                  {categories.length === 0 ? (
                    <div className="py-2 text-sm text-slate-600">No categories yet.</div>
                  ) : (
                    categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/products?category=${encodeURIComponent(c.slug)}`}
                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                        onClick={closeMobile}
                      >
                        {c.name}
                      </Link>
                    ))
                  )}
                </div>
              ) : null}
              <Link
                href="/cart"
                className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-blue-600 px-4 py-4 text-[15px] font-bold text-white shadow-lg shadow-blue-600/25"
                onClick={closeMobile}
              >
                <span className="inline-flex items-center gap-3">
                  <CartIcon className="h-6 w-6 shrink-0" />
                  <span>View cart</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-sm tabular-nums",
                      count > 0 ? "bg-white text-blue-700" : "bg-white/20 text-white",
                    )}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                </span>
                {count > 0 ? <span className="text-sm font-bold text-white/95">{formatPKR(subtotal)}</span> : null}
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
