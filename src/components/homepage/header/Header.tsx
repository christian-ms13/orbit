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
            style = {{ textShadow: "0 0 10px #00ffffcc, 0 0 20px #00ffff99, 0 0 30px #00ffff66, 0 0 40px #00ffff33" }}
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
