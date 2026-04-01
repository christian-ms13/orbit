import { useI18n } from "@/i18n/I18nProvider"
import { IconBrandFigma, IconBrandGithub, IconX } from "@tabler/icons-react"
import Link from "next/link"

interface OverlayProps {
  onClose: () => void
}

export default function Overlay({onClose}: OverlayProps) {
  const { setLanguage, t } = useI18n()

  const buttonClassName = "active:bg-overlay-button-border bg-overlay-button-fill border-2 border-overlay-button-border capitalize flex font-overlay-button gap-1 items-center justify-center p-1.5 rounded-2xl text-overlay-button-icon-fill text-xl w-full"

  const languageButtonsProps = [
    {
      gradientColors: "var(--color-overlay-button-english-gradient-0), var(--color-overlay-button-english-gradient-1), var(--color-overlay-button-english-gradient-2)",
      onClick: () => setLanguage("en"),
      text: t("overlay.english")
    },
    {
      gradientColors: "var(--color-overlay-button-spanish-gradient-0), var(--color-overlay-button-spanish-gradient-1), var(--color-overlay-button-spanish-gradient-2)",
      onClick: () => setLanguage("es"),
      text: t("overlay.spanish")
    }
  ]

  const projectButtonsProps = [
    {
      gradient: true,
      gradientColors: "var(--color-overlay-button-figma-gradient-0), var(--color-overlay-button-figma-gradient-1), var(--color-overlay-button-figma-gradient-2), var(--color-overlay-button-figma-gradient-3), var(--color-overlay-button-figma-gradient-4)",
      href: "https://www.figma.com/design/mBHbUeowUpy3e4rIgle9jF/orbit?m=auto&t=1eDsvdQSmILyoSlI-1",
      icon: <IconBrandFigma />,
      text: t("overlay.figma")
    },
    {
      gradient: false,
      gradientAlternative: "text-overlay-button-github",
      href: "https://github.com/chriistianms/orbit",
      icon: <IconBrandGithub />,
      text: t("overlay.github")
    }
  ]

  return (
    <div
      className = "backdrop-blur-xl bg-black/80 fixed flex flex-col items-center justify-center left-0 min-h-screen px-14 top-0 w-full z-3"
      onClick = {onClose}
    >
      <IconX
        className = "absolute right-3 text-overlay-menu-close-button top-4.5"
        onClick = {onClose}
        stroke = {3}
      />

      <div className = "flex flex-col gap-2 w-max" onClick = { (e) => e.stopPropagation() }>
        {projectButtonsProps.map(({ gradient, gradientAlternative, gradientColors, href, icon, text }, i) => (
          <Link
            className = {buttonClassName}
            href = {href}
            key = {i}
            rel = "noopener noreferrer"
            target = "_blank"
          >
            {icon}
            <span
              className = { `${gradient ? "bg-clip-text text-transparent" : gradientAlternative}` }
              style = {{ backgroundImage: gradient ? `linear-gradient(to right, ${gradientColors})` : undefined }}
            >
              {text}
            </span>
          </Link>
        ))}

        <div className = "flex gap-2 items-center justify-between w-full">
          {languageButtonsProps.map(({ gradientColors, onClick, text }, i) => (
            <button
              className = {buttonClassName}
              key = {i}
              onClick = {onClick}
            >
              <span
                className = "bg-clip-text text-transparent"
                style = {{ backgroundImage: `linear-gradient(to right, ${gradientColors})` }}
              >
                {text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
