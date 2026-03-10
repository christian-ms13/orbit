"use client"

import { useI18n } from "@/i18n/I18nProvider"

export default function OptimalPathResults() {
  const { t } = useI18n()

  return (
    <div className = "flex flex-col gap-5">
      <h2 className = "font-optimal-path-results-title text-sm text-optimal-path-results-title uppercase">
        {t("optimal-path-results.title")}
      </h2>

      <h3 className = "animate-pulse-fast font-optimal-path-results-state text-2xl text-center text-optimal-path-results-state tracking-wider uppercase">
        {t("optimal-path-results.state.waiting")}
      </h3>
    </div>
  )
}
