export default function ReadRibbon() {
  return (
    <span
      aria-label="Leído"
      className="pointer-events-none absolute right-0 top-0 z-20 h-20 w-20 overflow-hidden rounded-tr-xl"
    >
      <span className="absolute right-[-2.1rem] top-3.5 w-28 rotate-45 bg-green-500 py-1 text-center text-[9px] font-bold tracking-wide text-white shadow-md">
        LEÍDO
      </span>
    </span>
  )
}
