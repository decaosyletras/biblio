import { Gauge } from "lucide-react"

export default function LectometerMark({
  variant = "icon",
}: {
  variant?: "icon" | "note"
}) {
  if (variant === "note") {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-300">
        <Gauge size={15} aria-hidden="true" />
        Leído y analizado por Casa de Libros Indie.
      </p>
    )
  }

  return (
    <span
      title="Analizado en el Lectómetro por Casa de Libros Indie"
      aria-label="Analizado en el Lectómetro por Casa de Libros Indie"
      className="absolute left-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-yellow-300/50 bg-zinc-950/90 text-yellow-400 shadow-lg backdrop-blur-sm"
    >
      <Gauge size={15} aria-hidden="true" />
    </span>
  )
}
