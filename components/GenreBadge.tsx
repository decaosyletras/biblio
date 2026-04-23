"use client"

const genreColors: Record<string, string> = {
  fantasia: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  cienciaFiccion: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  terror: "bg-red-500/20 text-red-300 border-red-500/30",
  misterio: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  thriller: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  aventura: "bg-green-500/20 text-green-300 border-green-500/30",
  ficcion: "bg-blue-500/20 text-blue-300 border-blue-500/30",
}

export default function GenreBadge({
  label,
  type,
}: {
  label: string
  type: string
}) {
  const color = genreColors[type] || "bg-zinc-700 text-zinc-300"

  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${color}`}>
      {label}
    </span>
  )
}