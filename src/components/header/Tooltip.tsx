export default function Tooltip({text}: {text: string}) {
  return (
    <div className = "-translate-x-1/2 absolute delay-200 duration-300 group-hover:opacity-100 left-1/2 mt-2 opacity-0 pointer-events-none top-full transition-opacity z-1">
      <div className = "-top-1.5 -translate-x-1/2 absolute border-b-[6px] border-b-header-tooltip-arrow border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent h-0 left-1/2 w-0" />

      <div className = "bg-header-tooltip-fill capitalize flex font-header-tooltip items-center justify-center pb-1 pt-2 px-2 rounded-md text-[0.8rem] text-header-tooltip-text whitespace-nowrap">
        {text}
      </div>
    </div>
  )
}
