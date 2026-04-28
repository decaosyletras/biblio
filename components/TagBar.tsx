"use client"

import {
  Zap,
  Brain,
  Heart,
  Swords,
  Globe,
  BookOpen,
  Layers,
} from "lucide-react"

const wordFixes: Record<string, string> = {
  tematica: "temática",
  generica: "genérica",
  basica: "básica",
}

function formatLabel(text: string) {
  return text
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .split(" ")
    .map((word) => wordFixes[word] || word)
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase())
}

// 🔥 mapa de iconos
const iconMap: Record<string, any> = {
  ritmo: Zap,
  complejidad: Brain,
  cargaEmocional: Heart,
  conflicto: Swords,
  worldbuilding: Globe,
  accesibilidad: BookOpen,
  profundidad: Layers,
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
  const Icon = iconMap[label] || Zap // fallback

  return (
    <div className="flex items-center gap-4">

      {/* 🔤 icono + nombre */}
      <div className="w-36 flex items-center gap-2 text-zinc-400">
        <Icon className="w-4 h-4 text-blue-400" />
        <span className="text-sm">
          {formatLabel(label)}
        </span>
      </div>

      {/* 🔥 barra */}
      <div className="flex-1 h-2 bg-zinc-700 rounded">
        <div
          className="h-2 bg-yellow-400 rounded transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 📝 texto */}
      <span className="text-xs text-zinc-300 w-14 text-right">
        {text}
      </span>

    </div>
  )
}