"use client"

import { findShortestPath, PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"
import { IconRocket, IconX, IconXboxA, IconXboxB } from "@tabler/icons-react"
import { useState } from "react"

interface FormProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setResultData: (data: PathState | null) => void
}

export default function Form({ isLoading, setIsLoading, setResultData }: FormProps) {
  const [inputValues, setInputValues] = useState(["", ""])

  const {t} = useI18n()

  const handleClearInput = (index: number) => {
    const newValues = [...inputValues]
    newValues[index] = ""
    setInputValues(newValues)

    const input = document.getElementById(`user-input-${index}`)
    input?.focus()
  }

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues]
    newValues[index] = value
    setInputValues(newValues)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValues[0] || !inputValues[1]) return

    setIsLoading(true)
    setResultData(null)

    try {
      const formData = new FormData()
      formData.append("actor1", inputValues[0])
      formData.append("actor2", inputValues[1])

      const response = await findShortestPath(
        { message: "", success: true },
        formData
      )

      setResultData(response)
    } catch (e) {
      console.error("❌ failed to find shortest path: ", e)
    } finally {
      setIsLoading(false)
    }
  }

  const inputsProps = [
    {
      Icon: IconXboxA,
      placeholder: t("form.input.placeholder.starting")
    },
    {
      Icon: IconXboxB,
      placeholder: t("form.input.placeholder.target")
    }
  ]

  const responsiveProperties = {
    "input.text": "390:text-xl",
    "submit-button.icon": "360:h-7 360:w-7 390:h-8 390:w-8",
    "submit-button.text": "360:text-xl 390:text-2xl"
  }

  return (
    <form
      className = "flex flex-col gap-6 w-full"
      onSubmit = {handleSubmit}
    >
      <div className = "flex flex-col gap-2">
        {inputsProps.map(({ Icon, placeholder }, i) => (
          <div
            className = "bg-form-input-fill border-2 border-form-input-border flex gap-3 items-center justify-between px-4 py-3 rounded-[25px]"
            key = {i}
          >
            <div className = "flex gap-3 items-center justify-start w-full">
              <Icon className = { i === 0 ? "drop-shadow-form-input-starting-tag text-form-input-starting-tag" : "drop-shadow-form-input-target-tag text-form-input-target-tag" } />

              <input
                autoComplete = "off"
                className = { `${ i === 0 ? "caret-form-input-starting-tag" : "caret-form-input-target-tag" } ${responsiveProperties["input.text"]} capitalize flex focus:outline-none font-form-input items-center justify-between placeholder-form-input-placeholder/30 placeholder:normal-case text-form-input-text text-lg w-full` }
                id = {`user-input-${i}`}
                name = {`actor${i + 1}`}
                onChange = { (e) => handleInputChange(i, e.target.value) }
                placeholder = {placeholder}
                type = "text"
                value = {inputValues[i]}
              />
            </div>

            {inputValues[i].length > 0 && (
              <button
                className = "text-form-input-clear-icon"
                onClick = { () => handleClearInput(i) }
                type = "button"
              >
                <IconX size = {20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className = { `${isLoading ? "cursor-not-allowed opacity-50" : "active:bg-form-active-submit-button-fill"} ${responsiveProperties["submit-button.text"]} bg-form-submit-button-fill drop-shadow-form-submit-button flex font-form-submit-button gap-3 items-center justify-center p-5 rounded-3xl text-form-submit-button-text text-lg tracking-wider uppercase` }
        disabled = {isLoading}
        type = "submit"
      >
        <IconRocket className = {responsiveProperties["submit-button.icon"]} size = {23} />
        {isLoading ? t("form.loading") : t("form.submit")}
      </button>
    </form>
  )
}
