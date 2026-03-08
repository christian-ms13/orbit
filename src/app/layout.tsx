import type { Metadata } from "next"
import "./globals.css"
import localfont from "next/font/local"

export const metadata: Metadata = {
  title: "Orbit",
  description: "Find the cinematic connection between any two stars."
}

const brandFont = localfont({
  src: "../fonts/fixga/regular.woff2",
  variable: "--font-brand"
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className = {brandFont.variable} lang = "en">
      <body className = "bg-background p-5">
        {children}
      </body>
    </html>
  )
}
