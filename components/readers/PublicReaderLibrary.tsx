"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { LibraryBig, Search } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import LectometerMark from "@/components/LectometerMark"
import ReadRibbon from "@/components/readers/ReadRibbon"
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
  isOwner = false,
}: {
  library: PublicReaderBook[]
  isOwner?: boolean
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
      <div className="mt-7 rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/40 px-5 py-9 text-center sm:px-8 sm:py-11">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
          <LibraryBig aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-zinc-100">
          {isOwner
            ? "Tu biblioteca todavía está vacía"
            : "Esta biblioteca todavía está vacía"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
          {isOwner
            ? "Explora la biblioteca general y agrega tus primeras lecturas."
            : "Mientras llegan sus primeras lecturas, puedes descubrir más historias independientes en el catálogo."}
        </p>
        <Link
          href={isOwner ? "/book-directory" : "/libros"}
          className="mt-5 inline-flex rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-400"
        >
          {isOwner ? "Explorar biblioteca general" : "Explorar catálogo"}
        </Link>
      </div>
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
              className={`rounded-full px-3.5 py-2 text-xs transition ${filter === value
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
                {book.review?.title && <LectometerMark />}
                {isRead && <ReadRibbon />}
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
