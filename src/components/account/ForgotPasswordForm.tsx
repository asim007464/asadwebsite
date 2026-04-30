"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo ?? undefined,
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess("If an account exists for this email, we sent a reset link. Check your inbox.");
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
      {success ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">{success}</div>
      ) : null}
      <div>
        <label htmlFor="forgot-email" className="text-sm font-semibold text-slate-900">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <p className="text-xs leading-relaxed text-slate-500">
        We&apos;ll email you a link to reset your password. Configure email templates and SMTP in your Supabase project if needed.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}
