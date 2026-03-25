"use client"

import { PathState } from "@/actions/orbit"
import { useState } from "react"
import ConnectionGraph from "./ConnectionGraph"
import Form from "./Form"
import OptimalPathResults from "./OptimalPathResults"

export default function Main() {
  const [isLoading, setIsLoading] = useState(false)
  const [resultData, setResultData] = useState<PathState | null>(null)

  return (
    <main className = "flex flex-1 flex-col gap-10">
      <Form
        isLoading = {isLoading} 
        setIsLoading = {setIsLoading} 
        setResultData = {setResultData} 
      />
      <ConnectionGraph resultData = {resultData} />
      <OptimalPathResults
        isLoading = {isLoading} 
        resultData = {resultData} 
      />
    </main>
  )
}
