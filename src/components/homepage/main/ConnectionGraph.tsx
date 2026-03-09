"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

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

export default function ConnectionGraph() {
  const [balls, setBalls] = useState({
    start: { left: "5%", top: "50%" },
    target: { left: "95%", top: "50%" }
  })

  useEffect(() => {
    const updatePositions = () => {
      setBalls({
        start: pickBallPosition(0, 45),
        target: pickBallPosition(55, 100)
      })
    }

    updatePositions()

    const interval = setInterval(updatePositions, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className = "border border-connection-graph-border flex flex-col gap-5 p-3 rounded-xl w-full">
      <div className = "flex items-center justify-between">
        <h3 className = "font-connection-graph-title-and-level-indicator text-connection-graph-title text-lg uppercase">connection graph</h3>

        <span className = "bg-connection-graph-level-indicator-fill border-2 border-connection-graph-level-indicator-border flex items-center justify-center px-2 py-0.5 rounded-lg">
          <p className = "font-connection-graph-title-and-level-indicator text-connection-graph-level-indicator-text text-sm">2 degrees</p>
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

          <div className = "absolute bg-connection-graph-starting-ball-fill drop-shadow-connection-graph-starting-ball h-2 rounded-full w-2" style = {{ left: balls.start.left, top: balls.start.top, transition: "all 2.5s ease-in-out" }} />
          <div className = "absolute bg-connection-graph-target-ball-fill drop-shadow-connection-graph-target-ball h-2 rounded-full w-2" style = {{ left: balls.target.left, top: balls.target.top, transition: "all 2.5s ease-in-out" }} />
        </div>

        <p className = "font-connection-graph-path-found-declaration text-connection-graph-path-found-declaration">path_found: <span className = "animate-pulse-fast font-connection-graph-path-found-value text-connection-graph-path-found-value">waiting...</span></p>
      </div>
    </div>
  )
}
