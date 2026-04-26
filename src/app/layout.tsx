import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Allura } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileBookFab } from "@/components/mobile-book-fab";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://golden-key-retreats.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Golden Key Retreats | Clean, Elevated Stays in Miami",
  description:
    "Golden Key Retreats by Natalie Ortega — clean, elevated short-term stays in Miami and Fort Lauderdale, built for comfort, simplicity, and trust.",
  applicationName: "Golden Key Retreats",
  appleWebApp: {
    capable: true,
    title: "Golden Key",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Golden Key Retreats",
    title: "Clean, Elevated Stays in Miami",
    description: "Luxury stays in Miami & Fort Lauderdale.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Golden Key Retreats — Clean, elevated stays in Miami & Fort Lauderdale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clean, Elevated Stays in Miami",
    description: "Luxury stays in Miami & Fort Lauderdale.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a24b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${allura.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MobileBookFab />
      </body>
    </html>
  );
}
