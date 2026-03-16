"use client"

import { PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"

interface OptimalPathResultsProps {
  isLoading: boolean
  resultData: PathState | null
}

export default function OptimalPathResults({ isLoading, resultData }: OptimalPathResultsProps) {
  const {t} = useI18n()

  const responsiveProperties = {
    "state": "360:tracking-widest 390:text-3xl 390:tracking-wider",
    "title": "360:text-base 390:text-lg"
  }

  return (
    <div className = "flex flex-col gap-5">
      <h2 className = { `${responsiveProperties["title"]} font-optimal-path-results-title text-optimal-path-results-title text-sm uppercase` }>
        {t("optimal-path-results.title")}
      </h2>

      <h3 className = { `${responsiveProperties["state"]} animate-pulse-fast font-optimal-path-results-state text-2xl text-center text-optimal-path-results-state tracking-wider uppercase` }>
        {t("optimal-path-results.state.waiting")}
      </h3>
    </div>
  )
}
