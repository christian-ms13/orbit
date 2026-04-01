"use client"

import { PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"
import { IconArrowNarrowRightDashed, IconLink, IconMovie, IconTimeline, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react/jsx-runtime"
import Tooltip from "../header/Tooltip"

interface OptimalPathResultsProps {
  isLoading: boolean
  resultData: PathState | null
}

export default function OptimalPathResults({ isLoading, resultData }: OptimalPathResultsProps) {
  const {t} = useI18n()
  const noneValue = t("optimal-path-results.desktop-summary.none")

  const formatRuntime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours <= 0) {
      return `${minutes}m`
    }

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const fallback = {
    eraSpanned: noneValue,
    sharedGenres: noneValue,
    sharedGenresTooltip: "",
    totalDegrees: "0",
    totalRuntime: "0m"
  }

  const formatSharedGenres = (genres: string[]): string => {
    if (genres.length === 0) {
      return fallback.sharedGenres
    }

    if (genres.length === 1) {
      return genres[0]
    }

    const firstGenre = genres[0]
    const secondGenrePreview = genres[1].slice(0, 3)

    return `${firstGenre}, ${secondGenrePreview}...`
  }

  const summaryValues = (() => {
    if (!resultData?.path?.length || !resultData.success) {
      return fallback
    }

    const movies = resultData.path.filter((node) => node.type === "Movie")
    const actorCount = resultData.path.filter((node) => node.type === "Actor").length

    const totalDegrees = Math.max(actorCount - 1, 0)

    const allYears = movies
      .map((movie) => {
        const yearText = String(movie.release_date ?? "").split("-")[0]
        const year = Number.parseInt(yearText, 10)

        return Number.isFinite(year) ? year : null
      })
      .filter((year): year is number => year !== null)

    const eraSpanned = allYears.length > 0
      ? `${Math.min(...allYears)} - ${Math.max(...allYears)}`
      : fallback.eraSpanned

    const totalRuntimeMinutes = movies.reduce((sum, movie) => {
      const runtime = Number(movie.runtime)

      return Number.isFinite(runtime) ? sum + runtime : sum
    }, 0)

    const totalRuntime = totalRuntimeMinutes > 0 ? formatRuntime(totalRuntimeMinutes) : fallback.totalRuntime

    const movieGenreLists = movies
      .map((movie) => Array.isArray(movie.genres) ? movie.genres.filter((genre): genre is string => typeof genre === "string" && genre.length > 0) : [])
      .filter((genres) => genres.length > 0)

    let sharedGenres = fallback.sharedGenres
    let sharedGenresTooltip = fallback.sharedGenres

    if (movieGenreLists.length > 0) {
      const intersection = movieGenreLists.slice(1).reduce(
        (acc, current) => acc.filter((genre) => current.includes(genre)),
        [...movieGenreLists[0]]
      )

      if (intersection.length > 0) {
        const topIntersectionGenres = intersection.slice(0, 2)
        sharedGenres = formatSharedGenres(topIntersectionGenres)
        sharedGenresTooltip = topIntersectionGenres.length > 1 ? topIntersectionGenres.join(", ") : ""
      } else {
        const genreFrequency = new Map<string, number>()

        movieGenreLists.flat().forEach((genre) => {
          genreFrequency.set(genre, (genreFrequency.get(genre) ?? 0) + 1)
        })

        const topGenres = [...genreFrequency.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([genre]) => genre)

        sharedGenres = formatSharedGenres(topGenres)
        sharedGenresTooltip = topGenres.length > 1 ? topGenres.join(", ") : ""
      }
    }

    return {
      eraSpanned,
      sharedGenres,
      sharedGenresTooltip,
      totalDegrees: String(totalDegrees),
      totalRuntime
    }
  })()

  const desktopSummaryProps = [
    {
      title: t("optimal-path-results.desktop-summary.total-degrees"),
      valueColor: "text-optimal-path-results-summary-total-degrees-value",
      value: summaryValues.totalDegrees
    },
    {
      title: t("optimal-path-results.desktop-summary.shared-genres"),
      valueColor: "text-optimal-path-results-summary-shared-genres-value",
      value: summaryValues.sharedGenres,
      valueTooltip: summaryValues.sharedGenresTooltip
    },
    {
      title: t("optimal-path-results.desktop-summary.era-spanned"),
      valueColor: "text-optimal-path-results-summary-era-spanned-and-total-runtime-value",
      value: summaryValues.eraSpanned
    },
    {
      title: t("optimal-path-results.desktop-summary.total-runtime"),
      valueColor: "text-optimal-path-results-summary-era-spanned-and-total-runtime-value",
      value: summaryValues.totalRuntime
    }
  ]

  const getErrorMessage = () => {
    switch (resultData?.message) {
      case "optimal-path-results.error.calculation-failed":
        return t("optimal-path-results.error.calculation-failed")
      case "optimal-path-results.error.misconfigured-environment":
        return t("optimal-path-results.error.misconfigured-environment")
      case "optimal-path-results.error.missing-names":
        return t("optimal-path-results.error.missing-names")
      case "optimal-path-results.error.no-connection":
        return t("optimal-path-results.error.no-connection")
      default:
        return ""
    }
  }

  const responsiveProperties = {
    "avatar.container": "768:h-20 768:w-20",
    "avatar.icon": "768:h-7 768:w-7",
    "card.details": "768:text-lg",
    "card.title": "768:text-2xl",
    "desktop-each-result-wrapper": "1024:hidden",
    "desktop-results-inner-wrapper": "1024:flex",
    "desktop-results-wrapper": "1024:bg-optimal-path-results-desktop-results-wrapper-fill 1024:border-4 1024:border-optimal-path-results-desktop-results-wrapper-border 1024:flex-row 1024:gap-10 1024:p-10 1024:rounded-3xl",
    "desktop-top-wrapper": "1024:flex",
    "desktop.arrow": "1024:block",
    "movie-icon.container": "1024:hidden",
    "optimal-path-results": "1024:px-[10%]",
    "poster.container": "768:w-22",
    "state": "1024:text-5xl 1024:tracking-wide 360:tracking-widest 390:text-3xl 390:tracking-wider",
    "title": "1024:hidden 360:text-base 390:text-lg"
  }

  return (
    <div className = { `${responsiveProperties["optimal-path-results"]} flex flex-col gap-5` }>
      <h2 className = { `${responsiveProperties["title"]} font-optimal-path-results-title text-optimal-path-results-title text-sm uppercase` }>
        {t("optimal-path-results.title")}
      </h2>

      <div className = { `${responsiveProperties["desktop-top-wrapper"]} flex-col gap-5 hidden` }>
        <div className = "flex flex-col gap-1 items-start justify-start">
          <div className = "flex gap-2 items-center justify-center">
            <IconTimeline className = "text-optimal-path-results-desktop-title-icon-fill" size = {40} />
            <h2 className = "capitalize font-optimal-path-results-desktop-title text-4xl text-optimal-path-results-desktop-title">
              {t("optimal-path-results.desktop-title")}
            </h2>
          </div>

          <p className = "font-optimal-path-results-desktop-description text-optimal-path-results-desktop-description tracking-widest">
            {t("optimal-path-results.desktop-description")}
          </p>
        </div>

        {resultData?.success && (
          <div className = "bg-optimal-path-results-summary-wrapper-fill border-2 border-optimal-path-results-summary-wrapper-border flex gap-5 items-center justify-center px-5 py-4 rounded-3xl self-end">
            {desktopSummaryProps.map((prop, i) => (
              <Fragment key = {i}>
                {i !== 0 && (
                  <div className = "border border-optimal-path-results-desktop-summary-separator self-stretch" />
                )}

                <div className = "flex flex-col font-optimal-path-results-desktop-results-and-summary gap-1 items-center justify-center">
                  <h4 className = "text-optimal-path-results-desktop-summary-title text-xs tracking-widest uppercase">
                    {prop.title}
                  </h4>

                  {prop.valueTooltip ? (
                    <div className = "group relative">
                      <span className = { `${prop.valueColor} capitalize text-2xl` }>
                        {prop.value}
                      </span>

                      <Tooltip text = {prop.valueTooltip} />
                    </div>
                  ) : (
                    <span className = { `${prop.valueColor} capitalize text-2xl` }>
                      {prop.value}
                    </span>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <h3 className = { `${responsiveProperties["state"]} animate-pulse-fast font-optimal-path-results-state text-2xl text-center text-optimal-path-results-state tracking-wider uppercase` }>
          {t("optimal-path-results.state.calculating")}
        </h3>
      ) : resultData && !resultData.success ? (
        <h3 className = { `${responsiveProperties["state"]} animate-pulse-fast font-optimal-path-results-state text-2xl text-center text-optimal-path-results-error tracking-wider uppercase` }>
          {getErrorMessage()}
        </h3>
      ) : !resultData?.path ? (
        <h3 className = { `${responsiveProperties["state"]} animate-pulse-fast font-optimal-path-results-state text-2xl text-center text-optimal-path-results-state tracking-wider uppercase` }>
          {t("optimal-path-results.state.waiting")}
        </h3>
      ) : (
        <div className = "flex flex-col relative w-full">
          <div className = { `${responsiveProperties["desktop-results-wrapper"]} flex flex-col gap-8 w-full` }>
            {resultData.path.map((node, i) => {
              const isActor = node.type === "Actor"
              const isEnd = i === resultData.path!.length - 1
              const isStart = i === 0

              const colorClass = isStart ? "text-optimal-path-results-origin" : isEnd ? "text-optimal-path-results-target" : "text-optimal-path-results-connection"
              const glowClass = isStart ? "border-optimal-path-results-origin drop-shadow-optimal-path-results-origin" : isEnd ? "border-optimal-path-results-target drop-shadow-optimal-path-results-target" : "border-optimal-path-results-connection drop-shadow-optimal-path-results-connection"
              const desktopGlowClass = isStart ? "drop-shadow-optimal-path-results-desktop-origin" : isEnd ? "drop-shadow-optimal-path-results-desktop-target" : "drop-shadow-optimal-path-results-desktop-connection"

              const isLineBlue = i === 0
              const isLinePurple = i === resultData.path!.length - 2
              const lineClass = isLineBlue ? "bg-optimal-path-results-origin" : isLinePurple ? "bg-optimal-path-results-target" : "bg-optimal-path-results-connection"

              const isArrowBlue = i === 0
              const isArrowPurple = i === resultData.path!.length - 2
              const arrowColorClass = isArrowBlue ? "text-optimal-path-results-origin" : isArrowPurple ? "text-optimal-path-results-target" : "text-optimal-path-results-connection"

              const releaseYear = node.release_date ? String(node.release_date).split("-")[0] : ""
              const votePercentage = node.vote_average ? `${Math.round(Number(node.vote_average) * 10)}%` : ""
              const tmdbUrl = isActor ? `https://www.themoviedb.org/person/${node.id}` : `https://www.themoviedb.org/movie/${node.id}`

              return (
                <Fragment key = {i}>
                  <div className = { `${responsiveProperties["desktop-each-result-wrapper"]} flex gap-4 items-center relative w-full` }>
                    {!isEnd && (
                      <div className = { `${lineClass} absolute h-[calc(100%+2rem)] left-8 top-1/2 w-0.5` } />
                    )}

                    {isActor ? (
                      <Link
                        className = { `${glowClass} ${responsiveProperties["avatar.container"]} bg-optimal-path-results-card-fill border-2 flex h-16 items-center justify-center overflow-hidden rounded-full shrink-0 w-16` }
                        href = {tmdbUrl}
                        rel = "noopener noreferrer"
                        target = "_blank"
                      >
                        {node.profile ? (
                          <Image
                            alt = {String(node.name)}
                            className = "h-full object-cover w-full"
                            height = {80}
                            src = {String(node.profile)}
                            width = {80}
                          />
                        ) : (
                          <IconUser className = {`${colorClass} ${responsiveProperties["avatar.icon"]} h-6 w-6`} />
                        )}
                      </Link>
                    ) : (
                      <div className = { `${glowClass} ${responsiveProperties["avatar.container"]} ${responsiveProperties["movie-icon.container"]} bg-optimal-path-results-card-fill border-2 flex h-16 items-center justify-center overflow-hidden rounded-full shrink-0 w-16` }>
                        <IconMovie className = {`${colorClass} ${responsiveProperties["avatar.icon"]} h-6 w-6`} />
                      </div>
                    )}

                    <Link
                      className = "bg-optimal-path-results-card-fill border border-optimal-path-results-card-border flex flex-1 gap-4 items-center justify-between min-w-0 p-4 rounded-2xl"
                      href = {tmdbUrl}
                      rel = "noopener noreferrer"
                      target = "_blank"
                    >
                      <div className = "flex flex-1 gap-4 items-center min-w-0">
                        {!isActor && node.poster && (
                          <div className = { `${responsiveProperties["poster.container"]} aspect-2/3 border border-optimal-path-results-card-border overflow-hidden rounded shrink-0 w-18` }>
                            <Image
                              alt = {String(node.title)}
                              className = "h-full object-cover w-full"
                              height = {132}
                              src = {String(node.poster)}
                              width = {88}
                            />
                          </div>
                        )}

                        <div className = "flex flex-1 flex-col justify-center min-w-0">
                          <h4 className = { `${responsiveProperties["card.title"]} font-optimal-path-results-results-title sm:text-pretty sm:whitespace-normal text-lg text-optimal-path-results-text-primary truncate w-full` }>
                            {String(node.name || node.title)}
                          </h4>

                          {isActor ? (
                            <span className = { `${colorClass} ${responsiveProperties["card.details"]} font-optimal-path-results-results-details mt-1 text-[0.9rem] tracking-widest uppercase` }>
                              { isStart ? t("optimal-path-results.results.origin-actor") : isEnd ? t("optimal-path-results.results.target-actor") : t("optimal-path-results.results.connection") }
                            </span>
                          ) : (
                            <div className = { `${responsiveProperties["card.details"]} flex flex-col font-optimal-path-results-results-details gap-0.5 mt-1 text-[0.9rem] text-optimal-path-results-text-secondary tracking-wider` }>
                              {releaseYear && (
                                <span>
                                  {releaseYear}
                                </span>
                              )}
                              {node.language && (
                                <span>
                                  {String(node.language)}
                                </span>
                              )}
                              {votePercentage && (
                                <span>
                                  {votePercentage}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {isActor && (
                        <div className = { `${isStart || isEnd ? "bg-optimal-path-results-card-border" : "bg-transparent"} flex items-center justify-center p-2 rounded-full shrink-0` }>
                          {isStart || isEnd ? (
                            <IconUser className = {colorClass} size = {20} />
                          ) : (
                            <IconLink className = "text-optimal-path-results-connection" size = {20} />
                          )}
                        </div>
                      )}
                    </Link>
                  </div>

                  <div className = { `${responsiveProperties["desktop-results-inner-wrapper"]} font-optimal-path-results-desktop-results-and-summary gap-10 hidden items-start justify-center` }>
                    <div className = "flex flex-col items-center justify-center max-w-50 w-max">
                      {isActor ? (
                        <Link
                          className = { `${desktopGlowClass} bg-optimal-path-results-card-fill border-3 flex h-20 items-center justify-center mb-9 mt-8 overflow-hidden rounded-full w-20` }
                          href = {tmdbUrl}
                          rel = "noopener noreferrer"
                          target = "_blank"
                        >
                          {node.profile ? (
                            <Image
                              alt = {String(node.name)}
                              src = {node.profile}
                              width = {80}
                              height = {80}
                              className = "rounded-full"
                            />
                          ) : (
                            <IconUser className = {colorClass} size = {40} />
                          )}
                        </Link>
                      ) : (
                        <Link
                          className = "aspect-2/3 border border-optimal-path-results-card-border overflow-hidden rounded shrink-0 w-25"
                          href = {tmdbUrl}
                          rel = "noopener noreferrer"
                          target = "_blank"
                        >
                          {node.poster ? (
                            <Image
                              alt = {String(node.title)}
                              height = {150}
                              src = {String(node.poster)}
                              width = {100}
                            />
                          ) : (
                            <div className = { `${responsiveProperties["poster.container"]} aspect-2/3 border border-optimal-path-results-card-border overflow-hidden rounded shrink-0 w-25 flex items-center justify-center` }>
                              <IconMovie className = {`${colorClass} h-6 w-6`} />
                            </div>
                          )}
                        </Link>
                      )}

                      <div className = "flex flex-col gap-1 items-center justify-center text-center">
                        <Link
                          className = "font-optimal-path-results-desktop-results-title hover:text-optimal-path-results-hover-desktop-actor-and-movie-name-and-title mt-4 text-optimal-path-results-desktop-actor-and-movie-name-and-title text-xl"
                          href = {tmdbUrl}
                          rel = "noopener noreferrer"
                          target = "_blank"
                        >
                          {String(node.name || node.title)} {!isActor && node.release_date ? `(${String(node.release_date).split("-")[0]})` : ""}
                        </Link>

                        <span className = "text-optimal-path-results-desktop-actor-and-movie-tag text-sm uppercase">
                          {isActor ? t("optimal-path-results.desktop-actor.tag") : t("optimal-path-results.desktop-movie.tag")}
                        </span>
                      </div>
                    </div>

                    {!isEnd && (
                      <IconArrowNarrowRightDashed className = { `${arrowColorClass} ${responsiveProperties["desktop.arrow"]} hidden mt-12` } size = {50} />
                    )}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
