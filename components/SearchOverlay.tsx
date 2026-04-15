"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function SearchOverlay({
  placeholder,
  data,
  type,
}: {
  placeholder: string
  data: any[]
  type: "books" | "authors" | "reviews"
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // 🔥 FORZAR FOCO REAL (clave en móvil)
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const q = normalize(query)

  const filtered = data.filter((item) => {
    if (!q) return false

    if (type === "books") {
      return normalize(item.title).includes(q)
    }

    if (type === "authors") {
      return normalize(item.name).includes(q)
    }

    if (type === "reviews") {
      return normalize(item.title).includes(q)
    }

    return false
  })

  return (
    <div className="mb-6">

      {/* BOTÓN */}
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-zinc-800 p-3 rounded-lg text-left text-zinc-400"
      >
        🔍 {placeholder}
      </button>

      {/* OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black p-6 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-400"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* INPUT */}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full p-4 rounded-lg bg-zinc-800 text-zinc-100 outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* RESULTADOS */}
          <div className="mt-6 space-y-4 overflow-y-auto">

            {filtered.map((item) => {

              if (type === "reviews") {
                return (
                  <Link href={`/resenas/${item.slug}`} key={item.slug}>
                    <div className="bg-zinc-800 p-4 rounded-xl flex gap-4">
                      <img src={item.cover} className="w-12 h-20 object-cover rounded" />
                      <div>
                        <p>{item.title}</p>
                        <p className="text-xs text-zinc-400">
                          {item.review.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              }

              if (type === "books") {
                return (
                  <Link href={`/libros/${item.slug}`} key={item.slug}>
                    <div className="bg-zinc-800 p-4 rounded-xl flex gap-4">
                      <img src={item.cover} className="w-12 h-20 object-cover rounded" />
                      <p>{item.title}</p>
                    </div>
                  </Link>
                )
              }

              if (type === "authors") {
                return (
                  <Link href={`/autores/${item.slug}`} key={item.slug}>
                    <div className="bg-zinc-800 p-4 rounded-xl flex gap-4">
                      <img src={item.avatar} className="w-12 h-12 rounded-full" />
                      <p>{item.name}</p>
                    </div>
                  </Link>
                )
              }

              return null
            })}

            {query && filtered.length === 0 && (
              <p className="text-zinc-500 text-sm">
                No se encontraron resultados
              </p>
            )}

          </div>
        </div>
      )}

    </div>
  )
}