import nodemailer from "nodemailer";
import { z } from "zod";

const emailEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  MAIL_ADMIN_TO: z.string().min(1),
});

function getEmailEnv() {
  return emailEnvSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_ADMIN_TO: process.env.MAIL_ADMIN_TO,
  });
}

export async function sendOrderEmail(options: {
  subject: string;
  html: string;
  to?: string | null;
}) {
  const env = getEmailEnv();

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

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
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
}

