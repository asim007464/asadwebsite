import nodemailer from "nodemailer";
import { z } from "zod";

import { SITE_SHOP_NAME, SITE_SHORT_TAGLINE } from "@/lib/site-brand";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Multipart HTML + plain text for OTP mail (better client rendering than text-only). */
function verificationEmailHtml(options: {
  title: string;
  lead: string;
  code: string;
  footerNote: string;
}): string {
  const codeSafe = escapeHtml(options.code);
  const brand = escapeHtml(SITE_SHOP_NAME);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:8px;border:1px solid #e4e4e7;">
      <tr><td style="padding:28px 28px 8px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#18181b;">
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:0.02em;color:#3f3f46;">${brand}</p>
        <h1 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#18181b;">${escapeHtml(options.title)}</h1>
        <p style="margin:0 0 20px;line-height:1.5;color:#3f3f46;">${escapeHtml(options.lead)}</p>
        <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;padding:16px 20px;text-align:center;margin:0 0 20px;">
          <span style="font-family:ui-monospace,Consolas,monospace;font-size:28px;font-weight:700;letter-spacing:0.18em;color:#18181b;">${codeSafe}</span>
        </div>
        <p style="margin:0;line-height:1.5;font-size:13px;color:#71717a;">${escapeHtml(options.footerNote)}</p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#a1a1aa;">${brand} · ${escapeHtml(
      SITE_SHORT_TAGLINE,
    )}</p>
  </td></tr>
</table>
</body>
</html>`;
}

export function signupVerificationEmail(code: string): { subject: string; text: string; html: string } {
  const subject = `${SITE_SHOP_NAME}: confirm your email — code inside`;
  const text = [
    SITE_SHOP_NAME,
    "",
    "Use this one-time code to finish creating your account:",
    "",
    `  ${code}`,
    "",
    "This code expires in 15 minutes.",
    "",
    `If you did not start signup with ${SITE_SHOP_NAME}, ignore this message.`,
    "",
    SITE_SHORT_TAGLINE,
  ].join("\n");
  const html = verificationEmailHtml({
    title: "Confirm your email address",
    lead: `You started creating an account with ${SITE_SHOP_NAME}. Enter this one-time code on our website to continue. It expires in 15 minutes.`,
    code,
    footerNote: "If you did not request this email, you can safely ignore it. No account will be created.",
  });
  return { subject, text, html };
}

export function passwordResetVerificationEmail(code: string): { subject: string; text: string; html: string } {
  const subject = `${SITE_SHOP_NAME}: password reset code`;
  const text = [
    SITE_SHOP_NAME,
    "",
    "Use this one-time code to reset your password:",
    "",
    `  ${code}`,
    "",
    "This code expires in 15 minutes.",
    "",
    `If you did not request a reset for ${SITE_SHOP_NAME}, ignore this message.`,
  ].join("\n");
  const html = verificationEmailHtml({
    title: "Reset your password",
    lead: `We received a request to reset the password for your ${SITE_SHOP_NAME} account. Enter this code on the password-reset page. It expires in 15 minutes.`,
    code,
    footerNote: "If you did not request a password reset, you can ignore this email. Your password will stay the same.",
  });
  return { subject, text, html };
}

/** `.env` values are strings — `Boolean("false")` is true, which breaks SMTP_TLS on port 587. */
function boolFromEnv(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off", ""].includes(s)) return false;
  return false;
}

/** Trim and remove one pair of surrounding quotes from .env paste mistakes. */
function stripQuotes(trimmed: string): string {
  const t = trimmed.trim();
  if (t.length < 2) return t;
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function tidyEnvString(v: string | undefined): string {
  return stripQuotes((v ?? "").trim());
}

const emailEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.preprocess(boolFromEnv, z.boolean()),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  MAIL_ADMIN_TO: z.string().email(),
});

function getEmailEnv() {
  return emailEnvSchema.parse({
    SMTP_HOST: tidyEnvString(process.env.SMTP_HOST),
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: tidyEnvString(process.env.SMTP_USER),
    SMTP_PASS: tidyEnvString(process.env.SMTP_PASS),
    MAIL_FROM: tidyEnvString(process.env.MAIL_FROM),
    MAIL_ADMIN_TO: tidyEnvString(process.env.MAIL_ADMIN_TO),
  });
}

function createTransport() {
  const env = getEmailEnv();
  const isGmailStartTls =
    env.SMTP_HOST.replace(/\.$/, "").toLowerCase() === "smtp.gmail.com" && !env.SMTP_SECURE && env.SMTP_PORT === 587;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(isGmailStartTls ? { requireTLS: true } : {}),
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendOrderEmail(options: {
  subject: string;
  html: string;
  to?: string | null;
}) {
  const env = getEmailEnv();
  const transporter = createTransport();

  const to = [env.MAIL_ADMIN_TO, options.to].filter(Boolean).join(", ");

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendPlainEmail(options: { to: string; subject: string; text: string; html?: string }) {
  const env = getEmailEnv();
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    ...(options.html ? { html: options.html } : {}),
    headers: {
      "X-Auto-Response-Suppress": "All",
    },
  });
}

/** User-visible hint after SMTP failure; logs detail for server dashboards. */
export function formatEmailSendFailure(error: unknown): string {
  const detail =
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
  const login = tidyEnvString(process.env.SMTP_USER);
  const gmailReject = /535|BadCredentials|Username and Password not accepted/i.test(detail);

  console.error("[email] SMTP error:", detail, login ? `(SMTP_USER=${login})` : "");

  const gmailExplain = gmailReject
    ? `\nGmail rejects this login because SMTP_PASS is not accepted for SMTP_USER (${login || "unset"}). Open THAT exact inbox in Chrome, go to Security → App passwords → create a new Mail password, paste exactly 16 characters into SMTP_PASS, and set MAIL_FROM to the same address. The address you enter on signup is only the recipient; it does not change SMTP credentials.`
    : "";

  if (process.env.NODE_ENV === "development") {
    return `Could not send email: ${detail}.${gmailExplain}\nSMTP: port 587, SMTP_SECURE=false, no quotes or spaces inside SMTP_PASS.`;
  }
  return `Could not send email (SMTP rejected login).${gmailExplain}\nSMTP: Gmail App Password tied to SMTP_USER (${login || "?"}); restart server after editing .env.`.trim();
}

