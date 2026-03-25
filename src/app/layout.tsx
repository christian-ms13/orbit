import "./globals.css"

import I18nProvider from "@/i18n/I18nProvider"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import localfont from "next/font/local"

export const metadata: Metadata = {
  title: "Orbit",
  description: "Find the cinematic connection between any two stars."
}

const brandAndDesktopLanguageOptionsFont = localfont({
  src: "../fonts/fixga/regular.woff2",
  variable: "--font-brand-and-desktop-language-options"
})

const connectionGraphPathFoundDeclarationFont = localfont({
  src: "../fonts/cascadia-code/regular.woff2",
  variable: "--font-connection-graph-path-found-declaration"
})

const connectionGraphPathFoundStateFont = localfont({
  src: "../fonts/cascadia-code/bold.woff2",
  variable: "--font-connection-graph-path-found-state"
})

const connectionGraphTitleAndLevelIndicatorFont = localfont({
  src: "../fonts/pixelify-sans/regular.woff2",
  variable: "--font-connection-graph-title-and-level-indicator"
})

const footerFont = localfont({
  src: "../fonts/belgrano/regular.woff2",
  variable: "--font-footer"
})

const formDescriptionFont = localfont({
  src: "../fonts/brava-slab/semibold.woff2",
  variable: "--font-form-description"
})

const formInputFont = localfont({
  src: "../fonts/alata/regular.woff2",
  variable: "--font-form-input"
})

const formSubmitButtonFont = localfont({
  src: "../fonts/saira-stencil-one/regular.woff2",
  variable: "--font-form-submit-button"
})

const formTitleAndDesktopInputLabelFont = localfont({
  src: "../fonts/augmento/black.woff2",
  variable: "--font-form-title-and-desktop-input-label"
})

const headerTooltipFont = localfont({
  src: "../fonts/josefin-sans/regular.woff2",
  variable: "--font-header-tooltip"
})

const optimalPathResultsResultsDetailsFont = localfont({
  src: "../fonts/saira-extra-condensed/semibold.woff2",
  variable: "--font-optimal-path-results-results-details"
})

const optimalPathResultsResultsTitleFont = localfont({
  src: "../fonts/ancress/bold.woff2",
  variable: "--font-optimal-path-results-results-title"
})

const optimalPathResultsStateFont = localfont({
  src: "../fonts/bebas-neue/regular.woff2",
  variable: "--font-optimal-path-results-state"
})

const optimalPathResultsTitleFont = localfont({
  src: "../fonts/audiowide/regular.woff2",
  variable: "--font-optimal-path-results-title"
})

const overlayButtonFont = localfont({
  src: "../fonts/blinker/semibold.woff2",
  variable: "--font-overlay-button"
})

const fonts = [
  brandAndDesktopLanguageOptionsFont,
  connectionGraphPathFoundDeclarationFont,
  connectionGraphPathFoundStateFont,
  connectionGraphTitleAndLevelIndicatorFont,
  footerFont,
  formDescriptionFont,
  formInputFont,
  formSubmitButtonFont,
  formTitleAndDesktopInputLabelFont,
  headerTooltipFont,
  optimalPathResultsResultsDetailsFont,
  optimalPathResultsResultsTitleFont,
  optimalPathResultsStateFont,
  optimalPathResultsTitleFont,
  overlayButtonFont
]

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const responsiveProperties = {
    "body": "1024:p-0 440:px-5 768:px-10 930:px-15"
  }

  return (
    <html className = { `${ fonts.map(font => font.variable).join(" ") } antialiased cursor-default select-none` } lang = "en">
      <body className = { `${responsiveProperties["body"]} bg-background p-3 pb-12` }>
        <Analytics />
        <SpeedInsights />

        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
