"use client"

import { PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"
import { TranslationKey } from "@/i18n/dictionaries"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ConnectionGraphProps {
  resultData: PathState | null
}

const BALL_TRANSITION_MS = 2500

type PathStateDisplay = {
  color: string
  textKey: TranslationKey
}

const pickBallPosition = (minX: number, maxX: number) => {
  for (let i = 0; i < 100; i++) {
    const x = minX + Math.random() * (maxX - minX)
    const y = Math.random() * 100
    const distanceFromCenter = Math.hypot(x - 50, y - 50)

    if (distanceFromCenter >= 40) {
      return { left: `${x}%`, top: `${y}%` }
    }
  }

  return { left: `${minX}%`, top: "50%" }
}

export default function ConnectionGraph({ resultData }: ConnectionGraphProps) {
  const [balls, setBalls] = useState({
    start: { left: "5%", top: "50%" },
    target: { left: "95%", top: "50%" }
  })
  const [isGlowActive, setIsGlowActive] = useState(false)
  const isConnectionFound = Boolean(resultData?.success)

  const {t} = useI18n()

  const getPathState = (): PathStateDisplay => {
    if (resultData === null) {
      return {
        textKey: "connection.path-found-state.waiting",
        color: "#0df2f2"
      }
    }

    if (resultData.success) {
      return {
        textKey: "connection.path-found-state.true",
        color: "#9c57ea"
      }
    }

    return {
      textKey: "connection.path-found-state.false",
      color: "#f23a3a"
    }
  }

  const pathState = getPathState()

  const responsiveProperties = {
    "inner.path-round": "360:text-sm 390:text-base",
    "outer.level-indicator": "360:text-sm 390:text-base",
    "outer.title": "360:text-lg 390:text-xl"
  }

  useEffect(() => {
    const updatePositions = () => {
      setBalls({
        start: pickBallPosition(0, 45),
        target: pickBallPosition(55, 100)
      })
    }

    updatePositions()

    if (resultData?.success) {
      return
    }

    const interval = setInterval(updatePositions, 3000)

    return () => clearInterval(interval)
  }, [resultData?.success])

  useEffect(() => {
    if (!isConnectionFound) {
      setIsGlowActive(false)
      return
    }

    const timeout = setTimeout(() => {
      setIsGlowActive(true)
    }, BALL_TRANSITION_MS)

    return () => clearTimeout(timeout)
  }, [isConnectionFound])

  return (
    <div className = "border border-connection-graph-border flex flex-col gap-5 p-3 rounded-xl w-full">
      <div className = "flex items-center justify-between">
        <h2 className = { `${responsiveProperties["outer.title"]} font-connection-graph-title-and-level-indicator text-connection-graph-title uppercase` }>
          {t("connection-graph.title")}
        </h2>

        <span 
          className = {`flex items-center justify-center px-2 py-0.5 rounded-lg border-2 ${
            resultData?.message ? "bg-connection-graph-status-error-fill border-connection-graph-status-error-border" 
            : "bg-connection-graph-level-indicator-fill border-connection-graph-level-indicator-border"
          }`}
        >
          <p className = { `${responsiveProperties["outer.level-indicator"]} font-connection-graph-title-and-level-indicator ${
            resultData?.message ? "text-connection-graph-status-error-border"
            : "text-connection-graph-level-indicator-text"
          } text-xs uppercase` }>
            {resultData?.success ? (() => {
              const levels = Math.floor(((resultData.path?.length || 0) - 1) / 2);
              return `${levels} ${levels === 1 ? t("connection-graph.status.level") : t("connection-graph.status.levels")}`;
            })() : (resultData?.message ? t("connection-graph.status.error") : t("connection-graph.level-indicator.standby"))}
          </p>
        </span>
      </div>

      <div className = "bg-connection-graph-inner-fill border border-connection-graph-inner-border flex flex-col gap-5 items-center justify-center overflow-hidden px-3 py-8 rounded-lg">
        <div className = "flex items-center justify-center py-5 relative w-full">
          <div className = "border-2 border-connection-graph-logo-outer-border drop-shadow-connection-graph-logo flex items-center justify-center p-3 rounded-full w-fit">
            <div className = "bg-connection-graph-logo-inner-fill border-2 border-connection-graph-logo-inner-border drop-shadow-connection-graph-logo flex items-center justify-center p-3 rounded-full">
              <Image
                alt = "Minimal Logo"
                height = {30}
                src = "/logo/simplified_logo.png"
                width = {30}
              />
            </div>
          </div>

          <div
            className = "absolute h-2 w-2"
            style = {{ left: balls.start.left, top: balls.start.top, transition: `all ${BALL_TRANSITION_MS}ms ease-in-out` }}
          >
            <div
              className = "absolute -left-2 -top-2 h-6 w-6 rounded-full"
              style = {{
                animation: isGlowActive ? "star-halo-starting 1.8s ease-in-out infinite" : "none",
                background: "radial-gradient(circle, var(--color-connection-graph-starting-ball-glow) 0%, var(--color-connection-graph-starting-ball-glow) 18%, var(--color-connection-graph-starting-ball-glow-soft) 42%, transparent 78%)",
                opacity: isGlowActive ? .6 : 0,
                willChange: "opacity, filter"
              }}
            />
            <div className = "absolute bg-connection-graph-starting-ball-fill drop-shadow-connection-graph-starting-ball h-2 rounded-full w-2" />
          </div>
          <div
            className = "absolute h-2 w-2"
            style = {{ left: balls.target.left, top: balls.target.top, transition: `all ${BALL_TRANSITION_MS}ms ease-in-out` }}
          >
            <div
              className = "absolute -left-2 -top-2 h-6 w-6 rounded-full"
              style = {{
                animation: isGlowActive ? "1.8s ease-in-out infinite star-halo-target" : "none",
                background: "radial-gradient(circle, var(--color-connection-graph-target-ball-glow) 0%, var(--color-connection-graph-target-ball-glow) 18%, var(--color-connection-graph-target-ball-glow-soft) 42%, transparent 78%)",
                opacity: isGlowActive ? .6 : 0,
                willChange: "opacity, filter"
              }}
            />
            <div className = "absolute bg-connection-graph-target-ball-fill drop-shadow-connection-graph-target-ball h-2 rounded-full w-2" />
          </div>
        </div>

        <p className = { `${responsiveProperties["inner.path-round"]} font-connection-graph-path-found-declaration text-connection-graph-path-found-declaration text-xs` }>
          {t("connection.path-found")}
          <span 
            className = "font-connection-graph-path-found-state"
            style={{ 
              color: pathState.color,
              animation: pathState.textKey === "connection.path-found-state.true" 
                ? "2s cubic-bezier(.4, 0, .6, 1) infinite pulse-slow"
                : "1s cubic-bezier(.4, 0, .6, 1) infinite pulse-fast "
            }}
          >
            {t(pathState.textKey)}
          </span>
        </p>
      </div>
    </div>
  )
}
