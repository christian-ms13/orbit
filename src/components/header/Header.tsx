"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { IconMenu2 } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Overlay from "./Overlay"

export default function Header() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  const {t} = useI18n()

  return (
    <>
      <header className = "flex items-center justify-between">
        <Link
          className = "flex gap-3 items-center"
          href = "/"
          onClick = {(event) => {
            event.preventDefault()
            window.location.assign("/")
          }}
        >
          <Image
            alt = {t("header.logo-alt")}
            height = {30}
            priority
            src = "/logo/logo.png"
            width = {30}
          />

          <h1 
            className = "font-bold font-brand text-3xl text-white tracking-wider uppercase"
            style = {{ textShadow: "var(--text-shadow-header-title)" }}
          >
            orbit
          </h1>
        </Link>

        <IconMenu2
          className = "text-header-menu-toggle"
          onClick = { () => setIsOverlayVisible(!isOverlayVisible) }
          stroke = {3}
        />
      </header>

      { isOverlayVisible && <Overlay onClose = { () => setIsOverlayVisible(false) } /> }
    </>
  )
}
