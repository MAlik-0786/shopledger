import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StockFlow - Smart Inventory & POS Billing System",
  description: "Boost your retail efficiency with StockFlow. Real-time stock tracking, quick QR billing, and powerful sales analytics for modern merchants.",
  keywords: ["inventory management system", "POS software", "retail billing software", "stock tracking", "QR code billing", "sales analytics"],
  authors: [{ name: "StockFlow Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#6366f1",
  manifest: "/manifest.json",
  openGraph: {
    title: "StockFlow - Smart Inventory & POS Billing System",
    description: "The complete stock management and billing solution for retail shops.",
    url: "https://stockflow.demo",
    siteName: "StockFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StockFlow Dashboard Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockFlow - Smart Inventory & POS Billing System",
    description: "The complete stock management and billing solution for retail shops.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
