import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "../components/SiteHeader";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "VoiceboxMD - Checkout",
  description: "Subscribe to VoiceboxMD",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2XHVZNR4P"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C2XHVZNR4P');
          `}
        </Script>
      </head>
      <body className={`${quicksand.variable} font-[family-name:var(--font-quicksand)] antialiased`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
