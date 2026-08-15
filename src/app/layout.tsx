import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: SITE_SHOP_NAME,
    template: `%s · ${SITE_SHOP_NAME}`,
  },
  description: `${SITE_SHOP_NAME} — ${SITE_SHORT_TAGLINE} — fans, lighting, kitchen, grooming, COD Pakistan`,
  icons: {
    icon: [{ url: "/website-logo.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/website-logo.jpeg", type: "image/jpeg" }],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-clip`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-clip bg-transparent font-sans text-slate-900">
        <div className="site-backdrop" aria-hidden />
        <SiteHeader />
        <div className="flex-1 pt-[var(--site-header-height)]">
          <ScrollToTopOnNavigate />
          {children}
        </div>
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
