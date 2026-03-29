import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.phonemallexpress.com'),
  title: {
    default: "PhoneMallExpress™ | Premium Electronics and Accessories",
    template: "%s | PhoneMallExpress™"
  },
  description: "Genuine High Quality Electronics, Trade-ins, Repair Services, Audio Systems, Cameras, Computers, Servers, Accessories, Kitchenware, Phone Cases, Fast Chargers, Audio Gear, Smart Watches. Ultra-fast shipping and premium quality accessories for every device.",
  keywords: [
    "phone accessories", "phone cases", "fast chargers", "smartwatch accessories", "audio gear",
    "Samsung cases", "iPhone accessories", "gaming accessories", "USB-C cables",
    "Kenya", "Nairobi", "electronics shop",
    "iPhone prices in Kenya", "Samsung phones Kenya", "Same day delivery Nairobi",
    "Best phone shop Nairobi", "Original iPhone chargers Kenya", "Phone screen protectors Kenya",
    "JBL speakers Kenya", "Anker chargers Kenya", "Power banks Kenya",
    "Smart home gadgets Kenya", "Laptop accessories Kenya", "Gaming headsets Kenya",
    "Trade-ins Kenya", "Repair Services Kenya", "Audio Systems Kenya", "Cameras Kenya",
    "Computers Kenya", "Servers Kenya", "Kitchenware Kenya",
    "Phone Cases Nairobi", "Fast Chargers Nairobi", "Audio Gear Nairobi", "Smart Watches Nairobi"
  ],
  authors: [{ name: "PhoneMallExpress™" }],
  creator: "PhoneMallExpress™",
  publisher: "PhoneMallExpress™",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://www.phonemallexpress.com",
    siteName: "PhoneMallExpress™",
    title: "PhoneMallExpress™ | Premium Electronics and Accessories",
    description: "Premium Electronics and Accessories — smartphones, laptops, audio, repairs, and trade-ins. Ultra-fast delivery in Nairobi.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PhoneMallExpress™ — Premium Electronics & Accessories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhoneMallExpress™ | Premium Electronics and Accessories",
    description: "Premium Electronics and Accessories delivered with speed and quality. Nairobi's #1 electronics store.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "b7_7gDnXy-Ajx8cSOFSr_ohN6hAEvQCahf1AU7ApNf4",
    other: {
      "msvalidate.01": "F80FEDEA69035F955BF8F70DE8737393",
    },
  },
  alternates: {
    canonical: 'https://www.phonemallexpress.com',
  },
};

import { Providers } from "@/components/providers/Providers";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-sans)' }} suppressHydrationWarning>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        <Providers>
          <div className="site-wrapper flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
