"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPasswordAfterVerification, sendPasswordResetVerificationCode } from "@/app/auth/otp-actions";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const r = await sendPasswordResetVerificationCode(email);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSuccess("If your email matches an active account we sent a 6‑digit reset code.");
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
      setError("Enter the 6‑digit reset code emailed to this address.");
      return;
    }
    setLoading(true);
    try {
      const r = await resetPasswordAfterVerification(email.trim().toLowerCase(), clean, password);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSuccess("Password updated — redirecting to sign‑in...");
      window.setTimeout(() => {
        window.location.assign("/login");
      }, 900);
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={step === 1 ? onSendCode : onFinish} className="mt-6 space-y-4">
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
          disabled={step >= 2}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none enabled:focus:border-blue-300 enabled:focus:ring-4 enabled:focus:ring-blue-100 disabled:bg-slate-50"
        />
        {step === 2 ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep(1);
              setCode("");
            }}
            className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-60"
          >
            Use a different email
          </button>
        ) : null}
      </div>

      {step === 2 ? (
        <>
          <div>
            <label htmlFor="fp-code" className="text-sm font-semibold text-slate-900">
              6‑digit reset code
            </label>
            <input
              id="fp-code"
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
            <label htmlFor="fp-new" className="text-sm font-semibold text-slate-900">
              New password
            </label>
            <input
              id="fp-new"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="fp-confirm" className="text-sm font-semibold text-slate-900">
              Confirm password
            </label>
            <input
              id="fp-confirm"
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

      <p className="text-xs leading-relaxed text-slate-500">
        Reset relies on SMTP + an admin OTP table — codes expire quickly; request another if expired.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Please wait…" : step === 1 ? "Send reset code" : "Update password"}
      </button>
      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}
