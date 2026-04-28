"use client"

import { motion } from "framer-motion"
import {
  Zap,
  Brain,
  Heart,
  Swords,
  Globe,
  BookOpen,
  Layers
} from "lucide-react"

const icons: Record<string, any> = {
  ritmo: Zap,
  complejidad: Brain,
  cargaEmocional: Heart,
  conflicto: Swords,
  worldbuilding: Globe,
  accesibilidad: BookOpen,
  profundidad: Layers,
}

// 🔥 separar camelCase → bonito
function formatLabel(text: string) {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
}

export default function TagBadge({
  label,
  level,
  text,
}: {
  label: string
  level: number
  text: string
}) {
  const Icon = icons[label]

  // 🎨 colores por nivel (0,1,2)
  const colors = [
    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "bg-red-500/20 text-red-300 border-red-500/30",
  ]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border transition ${colors[level]}`}
    >
      {Icon && <Icon size={14} />}
      <span>
        {formatLabel(label)}: {text}
      </span>
    </motion.div>
  )
}