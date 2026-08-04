"use client"

import { useMemo, useState } from "react"
import CardReader from "@/components/readers/CardReader"
import type { PublicReaderSummary } from "@/lib/readers"

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export default function ReaderDirectory({
  readers,
}: {
  readers: PublicReaderSummary[]
}) {
  const [query, setQuery] = useState("")
  const visibleReaders = useMemo(() => {
    const normalizedQuery = normalize(query.trim())

    if (!normalizedQuery) return readers

    return readers.filter((reader) =>
      normalize(
        `${reader.displayName} ${reader.username} ${reader.bio}`
      ).includes(normalizedQuery)
    )
  }, [query, readers])

  return (
    <>
      <div className="mb-8 px-6">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar lector..."
          aria-label="Buscar por nombre o usuario"
          className="w-full rounded-xl bg-zinc-800 p-4 text-zinc-100 outline-none"
        />
      </div>

      {visibleReaders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
          {visibleReaders.map((reader) => (
            <CardReader key={reader.username} reader={reader} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-zinc-900 p-6 text-center text-sm text-zinc-500">
          {readers.length === 0
            ? "Todavía no hay perfiles públicos de lectores."
            : "No se encontraron lectores con esa búsqueda."}
        </p>
      )}
    </>
  )
}
