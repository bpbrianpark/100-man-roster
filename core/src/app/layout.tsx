import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Provider from "./components/Provider";
import Footer from "./components/Footer";
import AdSlot from "./components/AdSlot";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recall Race",
  description:
    "Recall Race is a fast-paced trivia experience—pick a category, race the clock, and climb the leaderboards.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  openGraph: {
    title: "Recall Race",
    description:
      "Challenge yourself to name as many items as possible before the timer hits zero.",
    url: "https://recallrace.com",
    siteName: "Recall Race",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recall Race",
    description:
      "Race the clock and test your knowledge across dozens of categories.",
  },
  icons: {
    icon: "/logo.svg",
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const bottomAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM;
  
  return (
    <html lang="en">
      <body>
        {adsenseClient ? (
          <Script
            id="adsense-loader"
            strategy="afterInteractive"
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
        <Provider>
        {children}
        {bottomAdSlot ? (
          <AdSlot slot={bottomAdSlot} className="bottom-banner-ad" />
        ) : null}
        <Footer />
        <SpeedInsights />
        <Analytics />
        </Provider>
      </body>
    </html>
  );
}
