import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { generateMetadata as generateSEO } from "@/lib/seo";
import { MetaMaskSuppressor } from "@/components/MetaMaskSuppressor";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...generateSEO(),
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://gridnexus.com",
  ),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
    shortcut: "/favicon.svg",
  },
  other: {
    // Prevent MetaMask and other crypto wallet extensions from auto-injecting
    "ethereum-provider": "disabled",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MetaMaskSuppressor />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
