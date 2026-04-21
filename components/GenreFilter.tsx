"use client"

import { useState } from "react"
import { genresCatalog } from "@/data/genres"
import { books } from "@/data/books"
import BookRow from "@/components/BookRow"

export default function GenreFilter() {
  const [selected, setSelected] = useState("")

  const filtered = selected
    ? books.filter(b => b.genre === selected)
    : []

  const genreLabel = genresCatalog.find(g => g.id === selected)?.label

  return (
    <div className="mb-16">

      {/* 🔥 CENTRADO */}
      <div className="flex flex-col items-center">

        <p className="text-lg text-zinc-300 mb-3 text-center">
          ¿Quieres algún género en específico?
        </p>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-zinc-800 text-zinc-100 px-6 py-3 rounded-xl outline-none border border-zinc-700 hover:border-zinc-500 transition"
        >
          <option value="">Explorar todo</option>

          {genresCatalog.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>

      </div>

      {/* 🔥 RESULTADO TIPO NETFLIX */}
      {selected && filtered.length > 0 && (
        <div className="mt-10">
          <BookRow
            title={`Explorando: ${genreLabel}`}
            books={filtered}
          />
        </div>
      )}

    </div>
  )
}