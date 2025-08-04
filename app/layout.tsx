import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Load DM Sans font
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

// Load Instrument Serif font
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Closed Companies",
  description: "A public archive of failed startups",
  generator: "v0.dev",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Closed Companies",
    description: "A public archive of failed startups",
    url: "https://closedcompanies.com",
    siteName: "Closed Companies",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Closed Companies - Startup Failure Archive Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Closed Companies",
    description: "A public archive of failed startups",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="font-dm-sans bg-[#0B0B0B] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
