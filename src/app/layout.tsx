import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SITE_NAME, SITE_URL } from "@/lib/public/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} | International Recruitment`,
    template: `%s | ${SITE_NAME}`,
  },

  description:
    "Red Stone Employment Agency connects candidates and employers through responsible international recruitment support.",

  openGraph: {
    title: SITE_NAME,
    description:
      "Responsible international recruitment support for candidates and employers.",
    url: SITE_URL,
    siteName: SITE_NAME,

    images: [
      {
        url: "/images/redstone-logo.png",
        width: 1254,
        height: 1254,
        alt: SITE_NAME,
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Responsible international recruitment support for candidates and employers.",
    images: ["/images/redstone-logo.png"],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}