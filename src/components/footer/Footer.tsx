"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { IconChevronUp, IconLanguageHiragana } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useI18n()

  const languageOptions = [
    {
      locale: "en" as const,
      text: t("overlay.english")
    },
    {
      locale: "es" as const,
      text: t("overlay.spanish")
    }
  ]

  const responsiveProperties = {
    "footer": "1024:flex",
    "copyright": ":hidden",
    "copyright.longer": ":block"
  }

  const socialProfilesProps = [
    {
      href: "https://github.com/chriistianms",
      title: t("footer.github")
    },
    {
      href: "https://www.linkedin.com/in/christian-millan-soria",
      title: t("footer.linkedin")
    }
  ]

  return (
    <footer className = { `${responsiveProperties.footer} bg-footer-fill font-footer hidden items-center justify-between px-[10%] py-5 text-xs w-full` }>
      <p className = { `${responsiveProperties.copyright} text-footer-copyright` }>
        {t("footer.copyright")}
      </p>

      <p className = { `${responsiveProperties["copyright.longer"]} hidden text-footer-copyright` }>
        {t("footer.longer-copyright")}
      </p>

      <div className = "flex gap-4 items-center justify-end">
        <div className = "relative">
          <button
            className = "capitalize cursor-pointer flex hover:text-footer-language-hover items-center text-footer-language"
            onClick = { () => setIsOpen(!isOpen) }
          >
            <IconLanguageHiragana size = {20} />
            <IconChevronUp className = { `${ isOpen ? "rotate-180" : "" } transition-transform` } size = {16} stroke = {3} />
          </button>

          {isOpen && (
            <>
              <div
                className = "fixed inset-0 z-1"
                onClick = { () => setIsOpen(false) }
              />

              <div className = "absolute bg-footer-fill bottom-full flex flex-col font-bold font-brand-and-desktop-language-options gap-1 mb-2 py-2 right-0 rounded text-footer-language-option-text tracking-wider w-max z-2">
                {languageOptions.map((lang) => (
                  <button
                    className = { `${ language === lang.locale ? "cursor-not-allowed opacity-30" : "cursor-pointer" } capitalize hover:bg-footer-language-option-text-hover px-2 py-1` }
                    key = {lang.locale}
                    onClick = { () => { setLanguage(lang.locale); setIsOpen(false) } }
                  >
                    <span>
                      {lang.text}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className = "flex gap-2 items-center justify-center text-footer-socials">
          {socialProfilesProps.map((profile, i) => (
            <Link
              className = "hover:text-footer-socials-hover"
              href = {profile.href}
              key = {i}
              target = "_blank"
            >
              {profile.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
