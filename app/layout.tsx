import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

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
  metadataBase: new URL('https://phonemallexpress.com'),
  title: {
    default: "Phone Mall Express | Premium Phone Accessories",
    template: "%s | Phone Mall Express"
  },
  description: "High-quality phone cases, fast chargers, audio gear, and smart watches. Ultra-fast shipping and premium quality accessories for every device.",
  keywords: ["phone accessories", "phone cases", "fast chargers", "smartwatch accessories", "audio gear"],
  authors: [{ name: "Phone Mall Express" }],
  creator: "Phone Mall Express",
  publisher: "Phone Mall Express",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://phonemallexpress.com",
    siteName: "Phone Mall Express",
    title: "Phone Mall Express | Premium Phone Accessories",
    description: "Premium phone accessories delivered with speed and quality. Elevate your mobile experience.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Phone Mall Express",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone Mall Express | Premium Phone Accessories",
    description: "Premium phone accessories delivered with speed and quality.",
    images: ["/twitter-image.jpg"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <CartProvider>
          <div className="site-wrapper flex flex-col min-h-screen">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
