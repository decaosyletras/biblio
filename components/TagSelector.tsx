"use client"

import { useState } from "react"

const featuredTags = [
  "aventura",
  "accion",
  "drama",
  "humor",
  "misterioaresolver",
  "reflexion",
  "ia",
  "supervivencia",
]

type Tag = {
  id: string
  label: string
}

type Props = {
  tagsCatalog: Tag[]
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  maxTags?: number
}

export default function TagSelector({
  tagsCatalog,
  selectedTags,
  setSelectedTags,
  maxTags = 6,
}: Props) {
  const [showAll, setShowAll] = useState(false)

  const selectedTagObjects = tagsCatalog.filter(tag =>
    selectedTags.includes(tag.id)
  )

  const availableTags = tagsCatalog.filter(tag => {
    if (selectedTags.includes(tag.id)) return false

    return showAll
      ? true
      : featuredTags.includes(tag.id)
  })

  const toggleTag = (tagId: string) => {
    const isSelected = selectedTags.includes(tagId)

    if (isSelected) {
      setSelectedTags(prev =>
        prev.filter(id => id !== tagId)
      )
      return
    }

    if (selectedTags.length >= maxTags) return

    setSelectedTags(prev => [...prev, tagId])
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">
          Etiquetas
        </h3>

        <span className="text-xs text-zinc-500">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        Selecciona hasta {maxTags} etiquetas que describan la historia. Esto nos ayuda a ubicarlo mejor en las categorías y secciones.
      </p>

      {/* SELECCIONADAS */}
      {selectedTagObjects.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            Seleccionadas
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="
                  px-3 py-2
                  rounded-full
                  text-sm
                  bg-yellow-500
                  text-black
                  font-medium
                  hover:bg-yellow-400
                  transition
                "
              >
                {tag.label} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DISPONIBLES */}
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
          Sugeridas
        </p>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              disabled={selectedTags.length >= maxTags}
              onClick={() => toggleTag(tag.id)}
              className="
                px-3 py-2
                rounded-full
                text-sm
                bg-zinc-800
                text-zinc-300
                hover:bg-zinc-700
                transition
                disabled:opacity-50
              "
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAll(prev => !prev)}
        className="text-sm text-yellow-400 hover:text-yellow-300"
      >
        {showAll ? "Ver menos etiquetas" : "Ver más etiquetas"}
      </button>

    </div>
  )
}