import Link from "next/link";
import { adminLogin } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : "";
  const nextRaw = typeof sp.next === "string" ? sp.next : "/admin";

  const errMsg =
    err === "auth"
      ? "Check your email and password."
      : err === "forbidden"
        ? "This account does not have admin access."
        : err === "1"
          ? "Sign-in failed."
          : "";

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(59_130_246/0.2),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(99_102_241/0.12),transparent)]"
        aria-hidden
      />
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/50 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 pb-10 pt-8 text-white">
          <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-50 ring-1 ring-white/20">
            Admin
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-blue-100">
            Use your storefront email and password. Only the owner and invited staff can access this panel.
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          {errMsg ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{errMsg}</div>
          ) : null}

          <form action={adminLogin} className={errMsg ? "mt-5 space-y-4" : "space-y-4"}>
            <input type="hidden" name="next" value={nextRaw} />
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-indigo-500"
            >
              Continue to dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <Link href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              ← Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
