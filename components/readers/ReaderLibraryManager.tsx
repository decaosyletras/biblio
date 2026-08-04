"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, LibraryBig, Search, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

type LibraryFilter = "all" | "read" | "pending"

export default function ReaderLibraryManager({
  books,
}: {
  books: DatabaseBook[]
}) {
  const {
    library,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    removeBook,
  } = useReaderLibrary()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<LibraryFilter>("all")

  const libraryBooks = useMemo(
    () => books.filter((book) => Boolean(library[book.id])),
    [books, library]
  )
  const readCount = libraryBooks.filter(
    (book) => library[book.id]?.isRead
  ).length
  const pendingCount = libraryBooks.length - readCount

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es")

    return libraryBooks.filter((book) => {
      const membership = library[book.id]
      const matchesFilter = filter === "all" ||
        (filter === "read" && membership?.isRead) ||
        (filter === "pending" && !membership?.isRead)

      if (!matchesFilter) return false
      if (!normalizedQuery) return true

      const searchable = [book.title, ...(book.authorNames ?? [])]
        .join(" ")
        .toLocaleLowerCase("es")

      return searchable.includes(normalizedQuery)
    })
  }, [filter, library, libraryBooks, query])

  if (libraryLoading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
        Cargando tu biblioteca...
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["Todos", libraryBooks.length, "text-yellow-300"],
          ["Leídos", readCount, "text-green-300"],
          ["Pendientes", pendingCount, "text-zinc-200"],
        ].map(([label, count, color]) => (
          <div
            key={String(label)}
            className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:rounded-2xl sm:p-5"
          >
            <p className="truncate text-xs text-zinc-500 sm:text-sm">{label}</p>
            <p className={`mt-1 text-2xl font-bold sm:text-3xl ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en mi biblioteca"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-3.5 pl-12 pr-4 outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            ["all", "Todos"],
            ["read", "Leídos"],
            ["pending", "Pendientes"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === value
                  ? "bg-yellow-500 font-semibold text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {message}
        </p>
      )}

      {libraryBooks.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 p-10 text-center">
          <LibraryBig className="mx-auto h-10 w-10 text-yellow-400" />
          <h2 className="mt-4 text-xl font-semibold">Tu biblioteca está vacía</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Explora la biblioteca indie y agrega los libros que te interesan o que ya leíste.
          </p>
          <Link
            href="/book-directory"
            className="mt-5 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-400"
          >
            Explorar biblioteca indie
          </Link>
        </div>
      ) : visibleBooks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          No hay libros que coincidan con este filtro.
        </div>
      ) : (
        <>
          {/* La biblioteca privada también aprovecha dos columnas en móvil; las
              acciones permanecen dentro de cada tarjeta con áreas táctiles claras. */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {visibleBooks.map((book) => {
            const membership = library[book.id]
            const isPending = pendingBookId === book.id

            return (
              <article
                key={book.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:flex-row sm:gap-4 sm:rounded-2xl sm:p-4"
              >
                <Link
                  href={`/libros/${book.slug}`}
                  className="aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:h-40 sm:w-28 sm:aspect-auto"
                >
                  <CoverImage
                    src={getBookCover(book.amazon, book.cover)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/libros/${book.slug}`}>
                    <h2 className="line-clamp-2 text-sm font-semibold hover:text-yellow-300">
                      {book.title}
                    </h2>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {(book.authorNames ?? []).join(", ") || "Autor independiente"}
                  </p>

                  <span
                    className={`mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      membership?.isRead
                        ? "bg-green-500/15 text-green-300"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {membership?.isRead ? "Leído" : "Pendiente"}
                  </span>

                  <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-3 sm:flex">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveBook(book.id, !membership?.isRead)}
                      className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg bg-zinc-700 px-2 py-2 text-xs transition hover:bg-zinc-600 disabled:opacity-50 sm:gap-1.5 sm:px-3"
                    >
                      <BookOpenCheck size={14} />
                      {membership?.isRead ? "Pendiente" : "Leído"}
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${book.title} de mi biblioteca`}
                      disabled={isPending}
                      onClick={() => removeBook(book.id)}
                      className="flex items-center justify-center rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
          </div>
        </>
      )}
    </div>
  )
}
