export default function LectometerMark({
  variant = "icon",
}: {
  variant?: "icon" | "note"
}) {
  if (variant === "note") {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-300">
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 font-serif text-xs font-black italic leading-none text-zinc-950"
        >
          L
        </span>
        Leído y analizado por Cas(z)a de Libros.
      </p>
    )
  }

  return (
    <span
      title="Analizado en el Lectómetro por Casa de Libros Indie"
      aria-label="Analizado en el Lectómetro por Casa de Libros Indie"
      className="absolute left-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-yellow-300/50 bg-zinc-950/90 font-serif text-sm font-black italic leading-none text-yellow-400 shadow-lg backdrop-blur-sm"
    >
      <span aria-hidden="true">L</span>
    </span>
  )
}
