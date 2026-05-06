"use client"

import { useEffect, useRef, useState } from "react"

export default function SubgenreSelector({
  genresCatalog,
  selectedGenres,
  selectedSubgenres,
  setSelectedSubgenres
}: any) {

  const [showToast, setShowToast] = useState(false)
  const selectionOrder = useRef<string[]>([])

  const maxSubgenres =
    selectedGenres.length === 4 ? 3 :
    selectedGenres.length === 3 ? 5 :
    selectedGenres.length === 2 ? 6 :
    7

  const availableSubgenres = genresCatalog
    .filter((g: any) => selectedGenres.includes(g.id))
    .flatMap((g: any) => g.subgenres)

  const toggleSubgenre = (id: string) => {
    if (selectedSubgenres.includes(id)) {
      setSelectedSubgenres((prev: string[]) =>
        prev.filter(s => s !== id)
      )

      selectionOrder.current = selectionOrder.current.filter(s => s !== id)
    } else {
      if (selectedSubgenres.length >= maxSubgenres) return

      setSelectedSubgenres((prev: string[]) => [...prev, id])
      selectionOrder.current.push(id)
    }
  }

  // 🔥 Ajuste automático cuando baja el límite
  useEffect(() => {
    if (selectedSubgenres.length > maxSubgenres) {
      const exceso = selectedSubgenres.length - maxSubgenres

      const nuevos = [...selectionOrder.current]
      const eliminados = nuevos.splice(-exceso)

      selectionOrder.current = nuevos

      setSelectedSubgenres((prev: string[]) =>
        prev.filter(s => !eliminados.includes(s))
      )

      // mostrar toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    }
  }, [maxSubgenres, selectedSubgenres])

  if (selectedGenres.length === 0) return null

  return (
    <div className="mb-6 relative">

      <h2 className="mb-2 font-semibold">
        Subgéneros (máx {maxSubgenres})
      </h2>

      <div className="flex flex-wrap gap-2">

        {availableSubgenres.map((s: any) => {
          const isSelected = selectedSubgenres.includes(s.id)

          return (
            <button
              key={s.id}
              onClick={() => toggleSubgenre(s.id)}
              className={`
                px-4 py-2 rounded-full text-sm transition-all duration-200
                ${isSelected
                  ? "bg-blue-400 text-black scale-100"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:scale-105"}
              `}
            >
              {s.label}
            </button>
          )
        })}

      </div>

      {/* ✨ TOAST */}
      {showToast && (
        <div className="absolute -bottom-10 left-0 right-0 mx-auto w-fit px-4 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 animate-fade-in">
          Se ajustó el límite automáticamente
        </div>
      )}

      {/* ✨ ANIMACIÓN */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.2s forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateY(6px);
          }
        }
      `}</style>

    </div>
  )
}