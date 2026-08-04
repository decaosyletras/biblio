"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { getBookCover } from "@/lib/amazon"
import type { PublicReaderBook } from "@/lib/readerLibrary"

type LibraryFilter = "all" | "read" | "pending"

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export default function PublicReaderLibrary({
  library,
}: {
  library: PublicReaderBook[]
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const readCount = library.filter((item) => item.isRead).length
  const pendingCount = library.length - readCount

  const visibleBooks = useMemo(() => {
    const normalizedQuery = normalize(query.trim())

    return library.filter(({ book, isRead }) => {
      const matchesFilter = filter === "all" ||
        (filter === "read" && isRead) ||
        (filter === "pending" && !isRead)

      if (!matchesFilter) return false
      if (!normalizedQuery) return true

      return normalize(
        [book.title, ...(book.authorNames ?? [])].join(" ")
      ).includes(normalizedQuery)
    })
  }, [filter, library, query])

  if (library.length === 0) {
    return (
      <p className="mt-6 max-w-2xl text-zinc-400">
        Esta biblioteca todavía no tiene libros.
      </p>
    )
  }

  const filters: Array<{
    value: LibraryFilter
    label: string
    count: number
  }> = [
    { value: "all", label: "Todos", count: library.length },
    { value: "read", label: "Leídos", count: readCount },
    { value: "pending", label: "Pendientes", count: pendingCount },
  ]

  return (
    <div className="mt-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título o autor"
            aria-label="Buscar en esta biblioteca"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(({ value, label, count }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`rounded-full px-3.5 py-2 text-xs transition ${
                filter === value
                  ? "bg-yellow-500 font-semibold text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {label} · {count}
            </button>
          ))}
        </div>
      </div>

      {visibleBooks.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visibleBooks.map(({ book, isRead }) => (
            <Link
              key={book.id}
              href={`/libros/${book.slug}`}
              className="group"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
                <CoverImage
                  src={getBookCover(book.amazon, book.cover)}
                  alt={book.title}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                />
                <span
                  className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-lg ${
                    isRead
                      ? "bg-green-500 text-white"
                      : "bg-zinc-900/90 text-zinc-200"
                  }`}
                >
                  {isRead ? "Leído" : "Pendiente"}
                </span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-zinc-200 group-hover:text-yellow-300">
                {book.title}
              </h3>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-7 text-center text-sm text-zinc-400">
          No hay libros que coincidan con esta búsqueda y filtro.
        </p>
      )}
    </div>
  )
}
