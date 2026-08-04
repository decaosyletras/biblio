"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, LibraryBig, Search, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

export default function BookDirectory({
  books,
}: {
  books: DatabaseBook[]
}) {
  const [query, setQuery] = useState("")
  const {
    user,
    userLoading,
    library,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    removeBook,
  } = useReaderLibrary()

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es")

    if (!normalizedQuery) return books

    return books.filter((book) => {
      const searchable = [
        book.title,
        ...(book.authorNames ?? []),
      ]
        .join(" ")
        .toLocaleLowerCase("es")

      return searchable.includes(normalizedQuery)
    })
  }, [books, query])

  return (
    <div>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título o autor"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-4 pl-12 pr-4 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      {!userLoading && !user && (
        <p className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-zinc-300">
          Puedes explorar libremente. Inicia sesión cuando quieras guardar un libro en tu biblioteca.
        </p>
      )}

      {message && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {message}
        </p>
      )}

      <p className="mt-6 text-sm text-zinc-500">
        {visibleBooks.length} {visibleBooks.length === 1 ? "libro" : "libros"}
      </p>

      {/* En móvil se usan dos tarjetas verticales por fila para evitar una lista
          excesivamente larga; desde sm recuperan el formato horizontal. */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {visibleBooks.map((book) => {
          const membership = library[book.id]
          const isPending = pendingBookId === book.id

          return (
            <article
              key={book.id}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 sm:flex-row sm:gap-4 sm:rounded-2xl sm:p-4"
            >
              <Link
                href={`/libros/${book.slug}`}
                className="aspect-[2/3] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-36 sm:w-24 sm:aspect-auto"
              >
                <CoverImage
                  src={getBookCover(book.amazon, book.cover)}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/libros/${book.slug}`}>
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 hover:text-yellow-300">
                    {book.title}
                  </h2>
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {(book.authorNames ?? []).join(", ") || "Autor independiente"}
                </p>

                {membership && (
                  <span
                    className={`mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      membership.isRead
                        ? "bg-green-500/15 text-green-300"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {membership.isRead ? "Leído" : "Pendiente"}
                  </span>
                )}

                <div className="mt-auto grid gap-2 pt-3 sm:flex sm:flex-wrap">
                  {!membership ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, false)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-yellow-500 px-2 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50 sm:w-auto sm:px-3"
                      >
                        <LibraryBig size={14} />
                        Agregar
                      </button>
                      <button
                        type="button"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, true)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:opacity-50 sm:w-auto sm:px-3"
                      >
                        <BookOpenCheck size={14} />
                        Ya lo leí
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex">
                        <button
                          type="button"
                          disabled={isPending || libraryLoading}
                          onClick={() => saveBook(book.id, !membership.isRead)}
                          className="rounded-lg bg-zinc-700 px-2 py-2 text-xs font-medium transition hover:bg-zinc-600 disabled:opacity-50 sm:px-3"
                        >
                          {membership.isRead ? "Marcar pendiente" : "Marcar leído"}
                        </button>
                        <button
                          type="button"
                          aria-label={`Quitar ${book.title} de mi biblioteca`}
                          disabled={isPending || libraryLoading}
                          onClick={() => removeBook(book.id)}
                          className="flex items-center justify-center rounded-lg border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {visibleBooks.length === 0 && (
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          No encontramos libros con esa búsqueda.
        </div>
      )}
    </div>
  )
}
