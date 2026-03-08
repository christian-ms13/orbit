"use client"

import { IconRocket, IconXboxA, IconXboxB } from "@tabler/icons-react"

export default function Form() {
  const inputsProps = [
    {
      Icon: IconXboxA,
      placeholder: "e.g. Pedro Pascal"
    },
    {
      Icon: IconXboxB,
      placeholder: "e.g. Harrison Ford"
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form
      className = "flex flex-col gap-6 w-full"
      onSubmit = { handleSubmit }
    >
      <div className = "flex flex-col gap-2">
        {inputsProps.map(({ Icon, placeholder }, i) => (
          <div
            className = "bg-form-input-fill border-2 border-form-input-border flex gap-3 items-center px-4 py-3 rounded-[25px]"
            key = { i }
          >
            <Icon className = {i === 0 ? "drop-shadow-form-input-starting-tag text-form-input-starting-tag" : "drop-shadow-form-input-target-tag text-form-input-target-tag"} />

            <input
              className = {`${i === 0 ? "caret-form-input-starting-tag" : "caret-form-input-target-tag"} capitalize flex focus:outline-none font-form-input items-center justify-between placeholder-form-input-placeholder/30 placeholder:normal-case text-form-input-text text-lg w-full`}
              placeholder = { placeholder }
            />
          </div>
        ))}
      </div>

      <button
        className = "active:bg-form-active-submit-button-fill bg-form-submit-button-fill drop-shadow-form-submit-button duration-150 flex font-form-submit-button gap-3 items-center justify-center p-5 rounded-3xl text-form-submit-button-text text-xl tracking-wider transition uppercase"
        type = "submit"
      >
        <IconRocket size = { 25 } />
        calculate path
      </button>
    </form>
  )
}
