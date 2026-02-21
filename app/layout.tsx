import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FinanceProvider } from "@/context/FinanceContext";

const proximaNova = localFont({
  src: "./fonts/ProximaNova-Regular.otf",
  variable: "--font-proxima-nova",
  weight: "400",
});

const spaceMono = localFont({
  src: [
    { path: "./fonts/SpaceMono-Regular.ttf", weight: "400" },
    { path: "./fonts/SpaceMono-Bold.ttf", weight: "700" }
  ],
  variable: "--font-space-mono",
});

const anton = localFont({
  src: "./fonts/anton.ttf",
  variable: "--font-anton",
  weight: "400",
});

const fatKat = localFont({
  src: "./fonts/FatKat.otf",
  variable: "--font-fatkat",
  weight: "400",
});

const kolRanko = localFont({
  src: "./fonts/kol-ranko.woff2",
  variable: "--font-kol-ranko",
  weight: "400",
});

const pixel = localFont({
  src: "./fonts/pixel.ttf",
  variable: "--font-pixel",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kolpay Ledger",
  description: "Next Generation Financial Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${proximaNova.variable} ${spaceMono.variable} ${anton.variable} ${fatKat.variable} ${kolRanko.variable} ${pixel.variable} font-sans antialiased tracking-tight`}
      >
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
