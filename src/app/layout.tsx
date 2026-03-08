import "./globals.css"

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
  formInputFont,
  formSubmitButtonFont
]

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className = {`${fonts.map(font => font.variable).join(" ")} antialiased cursor-default select-none`} lang = "en">
      <body className = "bg-background p-5">
        { children }
      </body>
    </html>
  )
}
