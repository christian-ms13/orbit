import "./globals.css"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import localfont from "next/font/local"

export const metadata: Metadata = {
  title: "Orbit",
  description: "Find the cinematic connection between any two stars."
}

const brandFont = localfont({
  src: "../fonts/fixga/regular.woff2",
  variable: "--font-brand"
})

const connectionGraphPathFoundDeclarationFont = localfont({
  src: "../fonts/cascadia-code/regular.woff2",
  variable: "--font-connection-graph-path-found-declaration"
})

const connectionGraphPathFoundValueFont = localfont({
  src: "../fonts/cascadia-code/bold.woff2",
  variable: "--font-connection-graph-path-found-value"
})

const connectionGraphTitleAndLevelIndicatorFont = localfont({
  src: "../fonts/pixelify-sans/regular.woff2",
  variable: "--font-connection-graph-title-and-level-indicator"
})

const formInputFont = localfont({
  src: "../fonts/alata/regular.woff2",
  variable: "--font-form-input"
})

const formSubmitButtonFont = localfont({
  src: "../fonts/saira-stencil-one/regular.woff2",
  variable: "--font-form-submit-button"
})

const fonts = [
  brandFont,
  connectionGraphPathFoundDeclarationFont,
  connectionGraphPathFoundValueFont,
  connectionGraphTitleAndLevelIndicatorFont,
  formInputFont,
  formSubmitButtonFont
]

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className = { `${ fonts.map(font => font.variable).join(" ") } antialiased cursor-default select-none` } lang = "en">
      <body className = "bg-background p-3">
        <Analytics />
        <SpeedInsights />

        {children}
      </body>
    </html>
  )
}
