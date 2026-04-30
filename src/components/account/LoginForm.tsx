"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
      ) : null}
      <div>
        <label htmlFor="login-email" className="text-sm font-semibold text-slate-900">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-semibold text-slate-900">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex flex-col gap-2 pt-2 text-center text-sm text-slate-600">
        <Link href="/forgot-password" className="font-semibold text-blue-700 hover:text-blue-800">
          Forgot password?
        </Link>
        <span>
          No account?{" "}
          <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
            Register
          </Link>
        </span>
      </div>
    </form>
  );
}
