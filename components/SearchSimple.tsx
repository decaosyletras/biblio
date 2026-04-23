"use client"

import { useState } from "react"
import Link from "next/link"

export default function SearchSimple({
  data,
  type,
}: {
  data: any[]
  type: "books" | "authors" | "reviews"
}) {
  const [query, setQuery] = useState("")

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const q = normalize(query)

  const filtered = data.filter((item) => {
    if (!q) return false

    if (type === "books") return normalize(item.title).includes(q)
    if (type === "authors") return normalize(item.name).includes(q)
    if (type === "reviews") return normalize(item.title).includes(q)

    return false
  })

  return (
    <div className="mb-8 px-6">

      {/* INPUT DIRECTO (sin overlay) */}
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full p-4 rounded-xl bg-zinc-800 text-zinc-100 outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* RESULTADOS */}
      {query && (
        <div className="mt-6 space-y-4">

          <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {filtered.map((item: any) => {

            // 🔥 RESEÑAS = LIBRO
            if (type === "reviews") {
              return (
                <Link href={`/libros/${item.slug}`} key={item.slug}>
                  <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">
                    <img src={item.cover} className="w-12 h-24" />
                    <p>{item.title}</p>
                  </div>
                </Link>
              )
            }

            if (type === "books") {
              return (
                <Link href={`/libros/${item.slug}`} key={item.slug}>
                  <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">
                    <img src={item.cover} className="w-12 h-24" />
                    <p>{item.title}</p>
                  </div>
                </Link>
              )
            }

            {/*if (type === "authors") {
              return (
                <Link href={`/autores/${item.slug}`} key={item.slug}>
                  <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">
                    <img src={item.avatar} className="w-12 h-12 rounded-full" />
                    <p>{item.name}</p>
                  </div>
                </Link>
              )
            }*/}

            return null
          })}

        </div>

          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm">
              No se encontraron resultados
            </p>
          )}

        </div>
      )}
    </div>
  )
}