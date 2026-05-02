import nodemailer from "nodemailer";
import { z } from "zod";

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

export async function sendPlainEmail(options: { to: string; subject: string; text: string }) {
  const env = getEmailEnv();
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
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

