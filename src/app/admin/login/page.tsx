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
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin access</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the same <span className="font-semibold">email and password</span> as your storefront account. Only the site owner and invited staff can
          open this panel.
        </p>

        {errMsg ? <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{errMsg}</div> : null}

        <form action={adminLogin} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextRaw} />
          <div>
            <label className="text-sm font-semibold text-slate-900">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-900">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-semibold text-blue-700 hover:text-blue-800">
            ← Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
