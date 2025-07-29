import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Instrument_Serif } from "next/font/google"
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
  openGraph: {
    title: "Closed Companies",
    description: "A public archive of failed startups",
    url: "https://closedcompanies.com",
    siteName: "Closed Companies",
    images: [
      {
        url: "https://closedcompanies.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Closed Companies Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Closed Companies",
    description: "A public archive of failed startups",
    images: ["https://closedcompanies.com/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="font-dm-sans bg-[#0B0B0B] text-white antialiased">{children}</body>
    </html>
  )
}
