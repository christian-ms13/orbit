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

type BallProps = {
  position: { left: string; top: string }
  animationName: string
  glowColor: string
  glowColorSoft: string
  fillClassName: string
  shadowClassName: string
}

type PathStateDisplay = {
  color: string
  textKey: TranslationKey
}

export default function ConnectionGraph({ resultData }: ConnectionGraphProps) {
  const [balls, setBalls] = useState({
    start: { left: "5%", top: "50%" },
    target: { left: "95%", top: "50%" }
  })
  const isConnectionFound = Boolean(resultData?.success)

  const {t} = useI18n()

  const ballProps: BallProps[] = [
    {
      animationName: 'star-halo-starting',
      fillClassName: 'bg-connection-graph-starting-ball-fill',
      glowColor: 'connection-graph-starting-ball-glow',
      glowColorSoft: 'connection-graph-starting-ball-glow-soft',
      position: balls.start,
      shadowClassName: 'drop-shadow-connection-graph-starting-ball'
    },
    {
      animationName: 'star-halo-target',
      fillClassName: 'bg-connection-graph-target-ball-fill',
      glowColor: 'connection-graph-target-ball-glow',
      glowColorSoft: 'connection-graph-target-ball-glow-soft',
      position: balls.target,
      shadowClassName: 'drop-shadow-connection-graph-target-ball'
    }
  ]

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
    "connection-graph": "1024:px-[10%]",
    "inner.desktop-background": "1024:block",
    "inner.desktop-inner-ball": "1024:block",
    "inner.desktop-moving-ball": "1024:h-3 1024:w-3",
    "inner.logo-wrapper": "1024:hidden",
    "inner.outer-logo-wrapper": "1024:border-connection-graph-inner-ball-wrapper-border 1024:drop-shadow-none 1024:p-10",
    "inner.path-round": "1024:hidden 360:text-sm 390:text-base",
    "inner.wrapper": "1024:[border-image:linear-gradient(to_right,var(--color-connection-graph-inner-desktop-border-gradient-0),var(--color-connection-graph-inner-desktop-border-gradient-1),var(--color-connection-graph-inner-desktop-border-gradient-2))_1] 1024:border-t-4 1024:border-t-transparent 1024:py-15 1024:rounded-none",
    "outer.heading": "1024:hidden",
    "outer.level-indicator": "360:text-sm 390:text-base",
    "outer.title": "360:text-lg 390:text-xl",
    "outer.wrapper": "1024:border-2 1024:border-connection-graph-outer-desktop-border 1024:overflow-hidden 1024:p-0 1024:rounded-3xl"
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

  return (
    <div className = {responsiveProperties["connection-graph"]}>
      <div className = { ` ${responsiveProperties["outer.wrapper"]} border border-connection-graph-border flex flex-col gap-5 p-3 rounded-xl w-full` }>
        <div className = { `${responsiveProperties["outer.heading"]} flex items-center justify-between` }>
          <h2 className = { `${responsiveProperties["outer.title"]} font-connection-graph-title-and-level-indicator text-connection-graph-title uppercase` }>
            {t("connection-graph.title")}
          </h2>

          <span 
            className = { `${ resultData?.message ? "bg-connection-graph-status-error-fill border-connection-graph-status-error-border" : "bg-connection-graph-level-indicator-fill border-connection-graph-level-indicator-border" } border-2 flex items-center justify-center px-2 py-0.5 rounded-lg` }
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

        <div className = { `${responsiveProperties["inner.wrapper"]} bg-connection-graph-inner-fill border border-connection-graph-inner-border flex flex-col gap-5 items-center justify-center overflow-hidden px-3 py-8 relative rounded-lg` }>
          <div className = { `${responsiveProperties["inner.desktop-background"]} absolute bg-[url(/connection-graph/connections.jpg)] bg-center bg-cover blur-[3px] hidden inset-0` } />
          <div className = "flex items-center justify-center py-5 relative w-full">
            <div className = { `${responsiveProperties["inner.outer-logo-wrapper"]} border-2 border-connection-graph-logo-outer-border drop-shadow-connection-graph-logo flex items-center justify-center p-3 rounded-full w-fit` }>
              <div className = { `${responsiveProperties["inner.logo-wrapper"]} bg-connection-graph-logo-inner-fill border-2 border-connection-graph-logo-inner-border drop-shadow-connection-graph-logo flex items-center justify-center p-3 rounded-full` }>
                <Image
                  alt = "Minimal Logo"
                  height = {30}
                  src = "/logo/simplified_logo.png"
                  width = {30}
                />
              </div>

              <div className = { `${responsiveProperties["inner.desktop-inner-ball"]} bg-connection-graph-desktop-inner-ball-fill p-2 rounded-full hidden` } />
            </div>

            {ballProps.map((ball, index) => (
              <div
                key = {index}
                className = { `${responsiveProperties["inner.desktop-moving-ball"]} absolute h-2 w-2` }
                style = {{ left: ball.position.left, top: ball.position.top, transition: `all ${BALL_TRANSITION_MS}ms ease-in-out` }}
              >
                <div
                  className = "absolute -left-2 -top-2 h-6 w-6 rounded-full"
                  style = {{
                    animation: isConnectionFound ? `${ball.animationName} 1.8s ease-in-out ${BALL_TRANSITION_MS}ms infinite` : "none",
                    background: `radial-gradient(circle, var(--color-${ball.glowColor}) 0%, var(--color-${ball.glowColor}) 18%, var(--color-${ball.glowColorSoft}) 42%, transparent 78%)`,
                    opacity: isConnectionFound ? .6 : 0,
                    transition: `${BALL_TRANSITION_MS}ms opacity 250ms ease`,
                    willChange: "opacity, filter"
                  }}
                />
                <div className = { `${ball.fillClassName} ${ball.shadowClassName} ${responsiveProperties["inner.desktop-moving-ball"]} absolute h-2 rounded-full w-2` } />
              </div>
            ))}
          </div>

          <p className = { `${responsiveProperties["inner.path-round"]} font-connection-graph-path-found-declaration text-connection-graph-path-found-declaration text-xs` }>
            {t("connection.path-found")}
            <span 
              className = "font-connection-graph-path-found-state"
              style = {{ 
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
    </div>
  )
}
