import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const editorial = Newsreader({
  variable: "--font-editorial",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://joshagarwal.com"),
  title: {
    default: "Josh Agarwal — engineer, MBA candidate, builder of AI-native systems",
    template: "%s · Josh Agarwal",
  },
  description:
    "P.Eng and Wharton MBA candidate. A public lab notebook on AI deployment, energy infrastructure, and knowledge systems — with a live 3D map of my second brain.",
  openGraph: {
    title: "Josh Agarwal — lab notebook",
    description:
      "Experiments in AI deployment, energy, and knowledge systems. Fly through my second brain at /brain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable} antialiased min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
