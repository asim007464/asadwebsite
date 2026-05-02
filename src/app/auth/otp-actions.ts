"use server";

import { createHash, randomInt } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  formatEmailSendFailure,
  passwordResetVerificationEmail,
  sendPlainEmail,
  signupVerificationEmail,
} from "@/lib/email";

const WINDOW_MS = 15 * 60 * 1000;

function otpBase() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "asad-email-otp";
}

function digest(emailNorm: string, code: string) {
  return createHash("sha256").update(`${otpBase()}|${emailNorm}|${code}`, "utf8").digest("hex");
}

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function genCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** True only for missing OTP table / stale PostgREST cache / missing grants on that table. */
function isOtpTableDataApiIssue(message: string) {
  const m = message;
  if (/could not find the table[^\n]*email_verification_codes/i.test(m)) return true;
  if (/permission denied for table[^\n]*email_verification_codes/i.test(m)) return true;
  if (
    /email_verification_codes/i.test(m) &&
    (/schema cache|could not find the (?:table|'[^']+' column)|PGRST20[458]/i.test(m))
  )
    return true;
  return false;
}

/** Map PostgREST / permission errors limited to our OTP storage into an actionable hint. */
function mapOtpDbError(message: string) {
  if (isOtpTableDataApiIssue(message)) {
    return "Supabase still cannot reach public.email_verification_codes via the API. Fixes: (1) Dashboard → Settings → API → Data API exposed schemas includes public. (2) Re-run supabase/email_verification_codes_otp.sql. (3) NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY must be from this same project — restart npm/Vercel after changing env.";
  }
  return message;
}

function otpLookupFailMessage(error: { message?: string } | null) {
  if (error?.message && isOtpTableDataApiIssue(error.message)) return mapOtpDbError(error.message);
  return "Invalid or expired verification code.";
}

export type OtpOk = { ok: true };
export type OtpFail = { ok: false; error: string };

export async function sendRegisterVerificationCode(email: string): Promise<OtpOk | OtpFail> {
  const em = normEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return { ok: false, error: "Enter a valid email." };

  const supabase = createSupabaseAdminClient();
  const { data: uid, error: rpcErr } = await supabase.rpc("lookup_auth_user_id", { email_input: em });
  if (rpcErr) return { ok: false, error: mapOtpDbError(rpcErr.message) };
  if (uid) return { ok: false, error: "An account already exists for this email. Sign in instead." };

  const code = genCode();
  const expires_at = new Date(Date.now() + WINDOW_MS).toISOString();

  const { error: delErr } = await supabase.from("email_verification_codes").delete().eq("email", em).eq("purpose", "register");
  if (delErr) return { ok: false, error: mapOtpDbError(delErr.message) };

  const { error: ins } = await supabase.from("email_verification_codes").insert({
    email: em,
    purpose: "register",
    code_hash: digest(em, code),
    expires_at,
  });
  if (ins) return { ok: false, error: mapOtpDbError(ins.message) };

  try {
    const { subject, text, html } = signupVerificationEmail(code);
    await sendPlainEmail({ to: em, subject, text, html });
  } catch (e) {
    return { ok: false, error: formatEmailSendFailure(e) };
  }
  return { ok: true };
}

export async function completeRegisterWithVerification(email: string, password: string, code: string): Promise<OtpOk | OtpFail> {
  const em = normEmail(email);
  const supabase = createSupabaseAdminClient();
  const hashed = digest(em, code.trim());

  const { data: row, error } = await supabase
    .from("email_verification_codes")
    .select("id,expires_at")
    .eq("email", em)
    .eq("purpose", "register")
    .eq("code_hash", hashed)
    .maybeSingle();

  if (error) return { ok: false, error: otpLookupFailMessage(error) };
  if (!row) return { ok: false, error: "Invalid or expired verification code." };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase.from("email_verification_codes").delete().eq("id", row.id);
    return { ok: false, error: "Code expired — request a new one." };
  }

  await supabase.from("email_verification_codes").delete().eq("id", row.id);

  const { error: usrErr } = await supabase.auth.admin.createUser({
    email: em,
    password,
    email_confirm: true,
  });
  if (usrErr) return { ok: false, error: usrErr.message };
  return { ok: true };
}

export async function sendPasswordResetVerificationCode(email: string): Promise<OtpOk | OtpFail> {
  const em = normEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return { ok: false, error: "Enter a valid email." };

  const supabase = createSupabaseAdminClient();
  const { data: uid, error: rpcErr } = await supabase.rpc("lookup_auth_user_id", { email_input: em });
  if (rpcErr) return { ok: false, error: mapOtpDbError(rpcErr.message) };
  if (!uid) {
    // Don’t disclose whether email exists — still pretend success client-side messaging generic
    return { ok: true };
  }

  const code = genCode();
  const expires_at = new Date(Date.now() + WINDOW_MS).toISOString();
  const { error: delErr } = await supabase.from("email_verification_codes").delete().eq("email", em).eq("purpose", "password_reset");
  if (delErr) return { ok: false, error: mapOtpDbError(delErr.message) };

  const { error: ins } = await supabase.from("email_verification_codes").insert({
    email: em,
    purpose: "password_reset",
    code_hash: digest(em, code),
    expires_at,
  });
  if (ins) return { ok: false, error: mapOtpDbError(ins.message) };

  try {
    const { subject, text, html } = passwordResetVerificationEmail(code);
    await sendPlainEmail({ to: em, subject, text, html });
  } catch (e) {
    return { ok: false, error: formatEmailSendFailure(e) };
  }
  return { ok: true };
}

export async function resetPasswordAfterVerification(email: string, code: string, newPassword: string): Promise<OtpOk | OtpFail> {
  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  const em = normEmail(email);
  const supabase = createSupabaseAdminClient();
  const hashed = digest(em, code.trim());

  const { data: row, error } = await supabase
    .from("email_verification_codes")
    .select("id,expires_at")
    .eq("email", em)
    .eq("purpose", "password_reset")
    .eq("code_hash", hashed)
    .maybeSingle();

  if (error) return { ok: false, error: otpLookupFailMessage(error) };
  if (!row) return { ok: false, error: "Invalid or expired verification code." };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase.from("email_verification_codes").delete().eq("id", row.id);
    return { ok: false, error: "Code expired — request a new one." };
  }

  await supabase.from("email_verification_codes").delete().eq("id", row.id);

  const { data: uid, error: uidErr } = await supabase.rpc("lookup_auth_user_id", { email_input: em });
  if (uidErr) return { ok: false, error: mapOtpDbError(uidErr.message) };
  if (!uid) return { ok: false, error: "Could not locate account." };

  const { error: upErr } = await supabase.auth.admin.updateUserById(uid, { password: newPassword });
  if (upErr) return { ok: false, error: upErr.message };
  return { ok: true };
}
