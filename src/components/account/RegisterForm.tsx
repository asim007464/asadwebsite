"use client";

import Link from "next/link";
import { useState } from "react";
import { completeRegisterWithVerification, sendRegisterVerificationCode } from "@/app/auth/otp-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const r = await sendRegisterVerificationCode(email);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSuccess("We emailed a 6‑digit verification code — check your inbox (and spam) within 15 minutes.");
      setStep(2);
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onFinish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const clean = code.replace(/\s/g, "");
    if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
      setError("Enter the 6‑digit verification code from your email.");
      return;
    }
    setLoading(true);
    try {
      const r = await completeRegisterWithVerification(email, password, clean);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error: sig } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (sig) {
        setSuccess("Account verified — please sign in with your email and password.");
        return;
      }
      setSuccess("Welcome — redirecting...");
      window.location.assign("/");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={step === 1 ? onSendCode : onFinish} className="mt-6 space-y-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{success}</div>
        ) : null}

        <div>
          <label htmlFor="reg-email" className="text-sm font-semibold text-slate-900">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            disabled={step >= 2}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none enabled:focus:border-blue-300 enabled:focus:ring-4 enabled:focus:ring-blue-100 disabled:bg-slate-50"
          />
          {step === 2 ? (
            <p className="mt-2 text-xs text-slate-500">
              Sending to <span className="font-semibold text-slate-700">{email}</span> —
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep(1);
                  setCode("");
                }}
                className="ml-1 font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-60"
              >
                Change email
              </button>
            </p>
          ) : null}
        </div>

        {step === 2 ? (
          <>
            <div>
              <label htmlFor="reg-code" className="text-sm font-semibold text-slate-900">
                6‑digit verification code
              </label>
              <input
                id="reg-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="______"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="text-sm font-semibold text-slate-900">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="text-sm font-semibold text-slate-900">
                Confirm password
              </label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Please wait…" : step === 1 ? "Send verification code" : "Verify & create account"}
        </button>
        <p className="text-xs leading-relaxed text-slate-500">
          Codes expire in fifteen minutes — delivered by email through the site SMTP settings (see Nodemailer env vars).
        </p>
        <p className="text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
