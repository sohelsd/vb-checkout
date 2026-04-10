import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import SiteHeader from "../components/SiteHeader";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "VoiceboxMD - Checkout",
  description: "Subscribe to VoiceboxMD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-[family-name:var(--font-quicksand)] antialiased`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
