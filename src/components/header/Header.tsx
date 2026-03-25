"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { IconBrandFigma, IconBrandGithub, IconMenu2 } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Overlay from "./Overlay"
import Tooltip from "./Tooltip"

export default function Header() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  const {t} = useI18n()

  const projectsProps = [
    {
      icon: <IconBrandFigma />,
      tooltip: t("header.projects.figma"),
      url: "https://www.figma.com/design/mBHbUeowUpy3e4rIgle9jF/orbit?m=auto&t=1eDsvdQSmILyoSlI-1"
    },
    {
      icon: <IconBrandGithub />,
      tooltip: t("header.projects.github"),
      url: "https://github.com/christianms13/orbit"
    }
  ]

  const responsiveProperties = {
    "header": "1024:bg-header-fill 1024:border-b-2 1024:border-header-border 1024:px-[10%] 1024:py-3",
    "overlay.button": "1024:hidden 1024:pointer-events-none",
    "projects": "1024:flex"
  }

  return (
    <>
      <header className = { `${responsiveProperties["header"]} flex items-center justify-between` }>
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
            className = "font-bold font-brand-and-desktop-language-options text-3xl text-white tracking-wider uppercase"
            style = {{ textShadow: "var(--text-shadow-header-title)" }}
          >
            orbit
          </h1>
        </Link>

        <IconMenu2
          className = { `${responsiveProperties["overlay.button"]} text-header-menu-toggle` }
          onClick = { () => setIsOverlayVisible(!isOverlayVisible) }
          stroke = {3}
        />

        <div className = { `${responsiveProperties["projects"]} gap-3 hidden items-center justify-end` }>
          {projectsProps.map((project, i) => (
            <Link
              className = "duration-200 group hover:text-header-projects-icon-hover-fill relative text-header-projects-icon-fill transition-colors"
              key = {i}
              href = {project.url}
              target = "_blank"
              rel = "noopener noreferrer"
            >
              {project.icon}
              <Tooltip text = {project.tooltip} />
            </Link>
          ))}
        </div>
      </header>

      { isOverlayVisible && <Overlay onClose = { () => setIsOverlayVisible(false) } /> }
    </>
  )
}
