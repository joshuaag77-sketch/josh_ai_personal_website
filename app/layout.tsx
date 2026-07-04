import type { Metadata } from "next";
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
  title: {
    default: "Joshua Agarwal — field notes from the deployment gap",
    template: "%s — Joshua Agarwal",
  },
  description:
    "Chemical engineer building AI systems inside heavy industry. Four years turning frontier AI into tools pipeline operators actually use; now at Wharton. A public lab notebook on what survives contact with the field.",
  openGraph: {
    title: "Joshua Agarwal — field notes from the deployment gap",
    description:
      "Chemical engineer building AI systems inside heavy industry. A public lab notebook on what survives contact with the field.",
    url: "https://josh-ai-personal-website.vercel.app",
    siteName: "Joshua Agarwal",
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
        className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
