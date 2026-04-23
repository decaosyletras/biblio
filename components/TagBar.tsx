"use client"

function formatLabel(text: string) {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
}

export default function TagBar({
  label,
  level,
  text,
}: {
  label: string
  level: number
  text: string
}) {
  const percentage = (level / 3) * 100

  return (
    <div className="flex items-center gap-4">

      {/* 🔤 nombre */}
      <span className="w-32 text-sm text-zinc-400">
        {formatLabel(label)}
      </span>

      {/* 🔥 barra */}
      <div className="flex-1 h-2 bg-zinc-700 rounded">
        <div
          className="h-2 bg-yellow-400 rounded"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 📝 texto */}
      <span className="text-xs text-zinc-300 w-24 text-right">
        {text}
      </span>

    </div>
  )
}