"use client"

import { findShortestPath, PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"
import { sanitizeActorNameInput } from "@/lib/actorName"
import { IconRocket, IconX, IconXboxA, IconXboxB } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

interface FormProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setResultData: (data: PathState | null) => void
}

type ActorSuggestion = {
  name: string
  source: "neo4j" | "tmdb"
}

export default function Form({ isLoading, setIsLoading, setResultData }: FormProps) {
  const [inputValues, setInputValues] = useState(["", ""])
  const [suggestions, setSuggestions] = useState<ActorSuggestion[][]>([[], []])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState([false, false])
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState([false, false])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState([-1, -1])
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)

  const inputWrapperRefs = useRef<Array<HTMLDivElement | null>>([null, null])
  const inputElementRefs = useRef<Array<HTMLInputElement | null>>([null, null])
  const debounceTimeoutRefs = useRef<Array<ReturnType<typeof setTimeout> | null>>([null, null])
  const requestIdRefs = useRef([0, 0])

  const {t} = useI18n()

  const updateArrayAtIndex = <T,>(arr: T[], index: number, value: T): T[] => {
    const newArr = [...arr]
    newArr[index] = value
    return newArr
  }

  const clearSuggestionStateForInput = (index: number) => {
    setSuggestions((prev) => updateArrayAtIndex(prev, index, []))
    setHasFetchedSuggestions((prev) => updateArrayAtIndex(prev, index, false))
    setIsFetchingSuggestions((prev) => updateArrayAtIndex(prev, index, false))
    setActiveSuggestionIndex((prev) => updateArrayAtIndex(prev, index, -1))
  }

  const fetchSuggestions = async (index: number, query: string, requestId: number) => {
    setIsFetchingSuggestions((prev) => updateArrayAtIndex(prev, index, true))
    setHasFetchedSuggestions((prev) => updateArrayAtIndex(prev, index, true))

    try {
      const response = await fetch(`/api/actors/suggest?q=${encodeURIComponent(query)}&limit=12`)

      if (!response.ok) {
        throw new Error(`failed to fetch actor suggestions: ${response.status}`)
      }

      const data = await response.json() as { suggestions?: ActorSuggestion[] }

      if (requestIdRefs.current[index] !== requestId) {
        return
      }

      const incomingSuggestions = Array.isArray(data.suggestions) ? data.suggestions : []

      setSuggestions((prev) => updateArrayAtIndex(prev, index, incomingSuggestions))
      setActiveSuggestionIndex((prev) => updateArrayAtIndex(prev, index, incomingSuggestions.length > 0 ? 0 : -1))
      setOpenDropdownIndex(index)
    } catch (error) {
      console.error("❌ failed to load actor suggestions:", error)

      if (requestIdRefs.current[index] === requestId) {
        setSuggestions((prev) => updateArrayAtIndex(prev, index, []))
        setActiveSuggestionIndex((prev) => updateArrayAtIndex(prev, index, -1))
      }
    } finally {
      if (requestIdRefs.current[index] === requestId) {
        setIsFetchingSuggestions((prev) => updateArrayAtIndex(prev, index, false))
      }
    }
  }

  const scheduleSuggestionsFetch = (index: number, value: string) => {
    if (debounceTimeoutRefs.current[index]) {
      clearTimeout(debounceTimeoutRefs.current[index] as ReturnType<typeof setTimeout>)
      debounceTimeoutRefs.current[index] = null
    }

    const sanitizedValue = sanitizeActorNameInput(value)

    if (sanitizedValue.length < 1) {
      requestIdRefs.current[index] += 1
      clearSuggestionStateForInput(index)
      setOpenDropdownIndex((prev) => (prev === index ? null : prev))
      return
    }

    debounceTimeoutRefs.current[index] = setTimeout(() => {
      requestIdRefs.current[index] += 1
      const requestId = requestIdRefs.current[index]
      void fetchSuggestions(index, sanitizedValue, requestId)
    }, 140)
  }

  const selectSuggestion = (index: number, value: string) => {
    setInputValues((prev) => updateArrayAtIndex(prev, index, value))
    setOpenDropdownIndex(null)
    clearSuggestionStateForInput(index)
    inputElementRefs.current[index]?.focus()
  }

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | FocusEvent) => {
      if (openDropdownIndex === null) {
        return
      }

      const activeWrapper = inputWrapperRefs.current[openDropdownIndex]
      if (!activeWrapper) {
        setOpenDropdownIndex(null)
        return
      }

      const target = event.target as Node | null
      if (!target || !activeWrapper.contains(target)) {
        setOpenDropdownIndex(null)
      }
    }

    document.addEventListener("mousedown", handleOutsideInteraction)
    document.addEventListener("focusin", handleOutsideInteraction)

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction)
      document.removeEventListener("focusin", handleOutsideInteraction)
    }
  }, [openDropdownIndex])

  useEffect(() => {
    const timeoutRefs = debounceTimeoutRefs.current

    return () => {
      timeoutRefs.forEach((timeoutId) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      })
    }
  }, [])

  const handleClearInput = (index: number) => {
    setInputValues((prev) => updateArrayAtIndex(prev, index, ""))
    requestIdRefs.current[index] += 1
    clearSuggestionStateForInput(index)
    setOpenDropdownIndex(null)
    inputElementRefs.current[index]?.focus()
  }

  const handleInputChange = (index: number, value: string) => {
    setInputValues((prev) => updateArrayAtIndex(prev, index, value))
    setOpenDropdownIndex(index)
    scheduleSuggestionsFetch(index, value)
  }

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputSuggestions = suggestions[index]

    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && inputSuggestions.length > 0) {
      e.preventDefault()

      setOpenDropdownIndex(index)
      setActiveSuggestionIndex((prev) => {
        const current = prev[index] >= 0 ? prev[index] : 0
        const next = e.key === "ArrowDown"
          ? (current + 1) % inputSuggestions.length
          : (current - 1 + inputSuggestions.length) % inputSuggestions.length

        return updateArrayAtIndex(prev, index, next)
      })

      return
    }

    if (e.key === "Enter" && openDropdownIndex === index && activeSuggestionIndex[index] >= 0) {
      e.preventDefault()
      selectSuggestion(index, inputSuggestions[activeSuggestionIndex[index]].name)
      return
    }

    if (e.key === "Escape" && openDropdownIndex === index) {
      e.preventDefault()
      setOpenDropdownIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedInputValues = inputValues.map((value) => sanitizeActorNameInput(value))

    if (!normalizedInputValues[0] || !normalizedInputValues[1]) return

    setIsLoading(true)
    setResultData(null)

    setInputValues(normalizedInputValues)

    try {
      const formData = new FormData()
      formData.append("actor1", normalizedInputValues[0])
      formData.append("actor2", normalizedInputValues[1])

      const response = await findShortestPath(
        { success: true },
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
            className = "bg-form-input-fill border-2 border-form-input-border flex gap-3 items-center justify-between px-4 py-3 relative rounded-[25px]"
            key = {i}
            ref = {(element) => {
              inputWrapperRefs.current[i] = element
            }}
          >
            <div className = "flex gap-3 items-center justify-start w-full">
              <Icon className = { i === 0 ? "drop-shadow-form-input-starting-tag text-form-input-starting-tag" : "drop-shadow-form-input-target-tag text-form-input-target-tag" } />

              <input
                autoComplete = "off"
                className = { `${ i === 0 ? "caret-form-input-starting-tag" : "caret-form-input-target-tag" } ${responsiveProperties["input.text"]} capitalize flex focus:outline-none font-form-input items-center justify-between placeholder-form-input-placeholder/30 placeholder:normal-case text-form-input-text text-lg w-full` }
                id = {`user-input-${i}`}
                name = {`actor${i + 1}`}
                onChange = { (e) => handleInputChange(i, e.target.value) }
                onFocus = {() => {
                  if (suggestions[i].length > 0 || isFetchingSuggestions[i] || hasFetchedSuggestions[i]) {
                    setOpenDropdownIndex(i)
                  }
                }}
                onKeyDown = {(e) => handleInputKeyDown(i, e)}
                placeholder = {placeholder}
                ref = {(element) => {
                  inputElementRefs.current[i] = element
                }}
                role = "combobox"
                aria-autocomplete = "list"
                aria-controls = {`actor-suggestions-${i}`}
                aria-expanded = {openDropdownIndex === i}
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

            {openDropdownIndex === i && sanitizeActorNameInput(inputValues[i]).length >= 1 && (
              <div
                className = "absolute backdrop-blur-md bg-[#0a1515f0] border border-form-input-border left-0 mt-2 overflow-hidden right-0 rounded-2xl top-full z-2"
                id = {`actor-suggestions-${i}`}
                role = "listbox"
              >
                {isFetchingSuggestions[i] && (
                  <p className = "capitalize font-form-input px-4 py-3 text-form-input-placeholder/80 text-sm">
                    {t("form.autocomplete.loading")}
                  </p>
                )}

                {!isFetchingSuggestions[i] && suggestions[i].length === 0 && hasFetchedSuggestions[i] && (
                  <p className = "font-form-input px-4 py-3 text-form-input-placeholder/70 text-sm">
                    {t("form.autocomplete.no-results")}
                  </p>
                )}

                {!isFetchingSuggestions[i] && suggestions[i].map((suggestion, suggestionIndex) => {
                  const isActive = activeSuggestionIndex[i] === suggestionIndex

                  return (
                    <button
                      className = {`${isActive ? "bg-[#123434] text-form-input-text" : "hover:bg-[#102626] text-form-input-placeholder/90"} border-b border-form-input-border/40 cursor-pointer duration-150 flex font-form-input items-center justify-between last:border-b-0 px-4 py-3 text-left transition-colors w-full`}
                      key = {`${suggestion.name}-${suggestionIndex}`}
                      onClick = {() => selectSuggestion(i, suggestion.name)}
                      onMouseDown = {(event) => event.preventDefault()}
                      role = "option"
                      aria-selected = {isActive}
                      type = "button"
                    >
                      <span className = "truncate">{suggestion.name}</span>
                      <span className = {`${suggestion.source === "neo4j" ? "border-form-input-starting-tag/35 text-form-input-starting-tag/80" : "border-form-input-target-tag/35 text-form-input-target-tag/80"} border font-form-input px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase`}>
                        {suggestion.source}
                      </span>
                    </button>
                  )
                })}
              </div>
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
