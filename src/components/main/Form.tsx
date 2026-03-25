"use client"

import { findShortestPath, PathState } from "@/actions/orbit"
import { useI18n } from "@/i18n/I18nProvider"
import { sanitizeActorNameInput } from "@/lib/actorName"
import { IconAiGateway, IconRocket, IconSwitchHorizontal, IconX, IconXboxA, IconXboxB, IconZoom } from "@tabler/icons-react"
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

  const handleSwitchInputs = () => {
    if (debounceTimeoutRefs.current[0]) {
      clearTimeout(debounceTimeoutRefs.current[0] as ReturnType<typeof setTimeout>)
      debounceTimeoutRefs.current[0] = null
    }

    if (debounceTimeoutRefs.current[1]) {
      clearTimeout(debounceTimeoutRefs.current[1] as ReturnType<typeof setTimeout>)
      debounceTimeoutRefs.current[1] = null
    }

    requestIdRefs.current[0] += 1
    requestIdRefs.current[1] += 1

    setInputValues((prev) => [prev[1], prev[0]])
    clearSuggestionStateForInput(0)
    clearSuggestionStateForInput(1)
    setOpenDropdownIndex(null)
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
      icon: IconXboxA,
      placeholder: t("form.input.placeholder.starting"),
      desktopLabel: t("form.input.desktop-label.starting")
    },
    {
      icon: IconXboxB,
      placeholder: t("form.input.placeholder.target"),
      desktopLabel: t("form.input.desktop-label.target")
    }
  ]

  const renderInputWrapper = (input: (typeof inputsProps)[number], i: number) => (
    <div className = "flex flex-col gap-3 w-full">
      <label htmlFor = {`user-input-${i}`} className = { `${ i === 0 ? "text-form-desktop-input-starting-label" : "text-form-desktop-input-target-label" } ${responsiveProperties["form.desktop-input-label"]} font-form-title-and-desktop-input-label hidden uppercase` }>
        {input.desktopLabel}
      </label>

      <div
        className = { `${responsiveProperties["input.wrapper"]} bg-form-input-fill border-2 border-form-input-border flex gap-3 items-center justify-between px-4 py-3 relative rounded-[25px]` }
        ref = {(element) => {
          inputWrapperRefs.current[i] = element
        }}
      >
        <div className = "flex gap-3 items-center justify-start w-full">
          <input.icon className = { `${ i === 0 ? "drop-shadow-form-input-starting-tag text-form-input-starting-tag" : "drop-shadow-form-input-target-tag text-form-input-target-tag" } ${responsiveProperties["input.icon"]}` } />
          <IconZoom className = { `${responsiveProperties["input.desktop-icon"]} hidden text-form-input-desktop-icon` } stroke = {3} />

          <input
            aria-autocomplete = "list"
            aria-controls = {`actor-suggestions-${i}`}
            aria-expanded = {openDropdownIndex === i}
            autoComplete = "off"
            className = { `${ i === 0 ? "caret-form-input-starting-tag" : "caret-form-input-target-tag" } ${responsiveProperties["input.text"]} capitalize flex focus:outline-none font-form-input items-center justify-between placeholder-form-input-placeholder/30 placeholder:normal-case selection:bg-form-input-selection-background selection:text-form-input-selection-text text-form-input-text text-lg w-full` }
            id = {`user-input-${i}`}
            name = {`actor${i + 1}`}
            onChange = { (e) => handleInputChange(i, e.target.value) }
            onFocus = {() => {
              if (suggestions[i].length > 0 || isFetchingSuggestions[i] || hasFetchedSuggestions[i]) {
                setOpenDropdownIndex(i)
              }
            }}
            onKeyDown = {(e) => handleInputKeyDown(i, e)}
            placeholder = {input.placeholder}
            ref = {(element) => {
              inputElementRefs.current[i] = element
            }}
            role = "combobox"
            type = "text"
            value = {inputValues[i]}
          />
        </div>

        {inputValues[i].length > 0 && (
          <button
            className = { `${responsiveProperties["input.clear-icon"]} text-form-input-clear-icon` }
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
              <p className = "font-form-input px-4 py-3 text-form-input-placeholder/80 text-sm">
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
                  aria-selected = {isActive}
                  className = {`${isActive ? "bg-[#123434] text-form-input-text" : "hover:bg-[#102626] text-form-input-placeholder/90"} border-b border-form-input-border/40 cursor-pointer duration-150 flex font-form-input items-center justify-between last:border-b-0 px-4 py-3 text-left transition-colors w-full`}
                  key = {`${suggestion.name}-${suggestionIndex}`}
                  onClick = {() => selectSuggestion(i, suggestion.name)}
                  onMouseDown = {(event) => event.preventDefault()}
                  role = "option"
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
    </div>
  )

  const responsiveProperties = {
    "form": "1024:bg-form-desktop-fill 1024:border-2 1024:border-form-desktop-border 1024:drop-shadow-form 1024:gap-7 1024:items-center 1024:justify-center 1024:p-10 1024:rounded-3xl 1024:w-[80%]",
    "form.description": "1024:block",
    "form.desktop-input-label": "1024:block",
    "form.desktop-input-wrapper": "1024:flex-row 1024:gap-4 1024:items-flex-end",
    "form.desktop-submit-button": "1024:[--tw-drop-shadow:drop-shadow(var(--drop-shadow-form-desktop-submit-button-0))_drop-shadow(var(--drop-shadow-form-desktop-submit-button-1))] 1024:cursor-pointer 1024:w-full",
    "form.switch-button": "1024:flex",
    "form.title": "1024:block",
    "form.wrapper": "1024:px-25",
    "input.clear-icon": "1024:cursor-pointer",
    "input.desktop-icon": "1024:block",
    "input.icon": "1024:hidden",
    "input.text": "390:text-xl",
    "input.wrapper": "1024:bg-transparent 1024:border-3 1024:border-form-desktop-input-wrapper-border 1024:rounded-xl",
    "submit-button.desktop-icon": "1024:block",
    "submit-button.icon": "1024:hidden 360:h-7 360:w-7 390:h-8 390:w-8 768:h-9 768:w-9",
    "submit-button.text": "360:text-xl 390:text-2xl 768:gap-5 768:text-3xl",
    "submit-button.text.desktop-span": "1024:block",
    "submit-button.text.span": "1024:hidden"
  }

  return (
    <>
      <style>
        {`
          @media (min-width: 1024px) {
            .submit-button-gradient {
              background-image: linear-gradient(to right, var(--color-form-desktop-submit-button-gradient-0), var(--color-form-desktop-submit-button-gradient-1));
            }

            .submit-button-gradient:active {
              background-image: linear-gradient(to right, var(--color-form-desktop-submit-button-active-gradient-0), var(--color-form-desktop-submit-button-active-gradient-1));
            }
          }
        `}
      </style>

      <div className = { `${responsiveProperties["form.wrapper"]} flex items-center justify-center w-full` }>
        <form
          className = { `${responsiveProperties["form"]} flex flex-col gap-6 w-full` }
          onSubmit = {handleSubmit}
        >
          <h2
            className = { `${responsiveProperties["form.title"]} bg-clip-text font-form-title-and-desktop-input-label hidden text-4xl text-transparent uppercase` }
            style = {{ backgroundImage: "linear-gradient(to right, var(--color-form-title-gradient-0), var(--color-form-title-gradient-1), var(--color-form-title-gradient-2))" }}
          >
            {t("form.title")}
          </h2>

          <p className = { `${responsiveProperties["form.description"]} font-form-description hidden text-form-description` }>
            {t("form.description")}
          </p>

          <div className = { `${responsiveProperties["form.desktop-input-wrapper"]} flex flex-col gap-2 w-full` }>
            <div className = "w-full">
              {renderInputWrapper(inputsProps[0], 0)}
            </div>

            <button
              className = { `${responsiveProperties["form.switch-button"]} active:bg-form-switch-button-active-fill bg-form-switch-button-fill border-3 border-form-switch-button-border cursor-pointer hidden hover:bg-form-switch-button-hover-fill items-center justify-center mb-2 p-2 rounded-full self-end text-form-switch-icon-fill` }
              onClick = {handleSwitchInputs}
              type = "button"
            >
              <IconSwitchHorizontal />
            </button>

            <div className = "w-full">
              {renderInputWrapper(inputsProps[1], 1)}
            </div>
          </div>

          <button
            className = { `${isLoading ? "cursor-not-allowed opacity-50" : "active:bg-form-active-submit-button-fill"} ${responsiveProperties["form.desktop-submit-button"]} ${responsiveProperties["submit-button.text"]} bg-form-submit-button-fill drop-shadow-form-submit-button flex font-form-submit-button gap-3 items-center justify-center p-5 rounded-3xl text-form-submit-button-text text-lg tracking-wider uppercase submit-button-gradient` }
            disabled = {isLoading}
            type = "submit"
          >
            <IconRocket className = {responsiveProperties["submit-button.icon"]} size = {23} />
            <IconAiGateway className = {`${responsiveProperties["submit-button.desktop-icon"]} hidden`} size = {23} stroke = {3} />
            <span className = {`${responsiveProperties["submit-button.text.span"]}`}>
              {isLoading ? t("form.loading") : t("form.submit")}
            </span>
            <span className = {`${responsiveProperties["submit-button.text.desktop-span"]} hidden`}>
              {isLoading ? t("form.loading") : t("form.desktop-submit")}
            </span>
          </button>
        </form>
      </div>
    </>
  )
}
