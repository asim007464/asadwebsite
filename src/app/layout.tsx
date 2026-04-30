import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_SHOP_NAME, SITE_SHORT_TAGLINE } from "@/lib/site-brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_SHOP_NAME,
    template: `%s · ${SITE_SHOP_NAME}`,
  },
  description: `${SITE_SHOP_NAME} — ${SITE_SHORT_TAGLINE} — fans, lighting, kitchen, grooming, COD Pakistan`,
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-hidden bg-transparent font-sans text-slate-900">
        <div className="site-backdrop" aria-hidden />
        <SiteHeader />
        <div className="flex-1 pt-[var(--site-header-height)]">{children}</div>
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
