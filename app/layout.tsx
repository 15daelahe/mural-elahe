import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Italianno } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Stars } from "@/components/Stars";
import { partyConfig } from "@/lib/config";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const script = Italianno({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${partyConfig.birthdayGirlName} · 15 anos`,
  description: partyConfig.subtitle,
  openGraph: {
    title: `${partyConfig.birthdayGirlName} · 15 anos`,
    description: partyConfig.subtitle,
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#fbf6ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <Stars />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
