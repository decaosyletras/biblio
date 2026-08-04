"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, LibraryBig, Plus, Search, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

function AddToLibraryIcon() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1" aria-hidden="true">
      <LibraryBig size={14} />
      <Plus
        size={11}
        strokeWidth={3}
      />
    </span>
  )
}

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

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 text-[10px] leading-tight text-zinc-300 sm:hidden">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg bg-yellow-500 px-1 text-black">
            <AddToLibraryIcon />
          </span>
          Agregar a biblioteca
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg bg-green-600 text-white">
            <BookOpenCheck size={14} aria-hidden="true" />
          </span>
          Agregar como leído
        </span>
      </div>

      {/* En celular se prioriza densidad con tres portadas verticales. Desde sm
          regresan las tarjetas horizontales y el ancho disponible permite
          crecer progresivamente hasta seis columnas. */}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {visibleBooks.map((book) => {
          const membership = library[book.id]
          const isPending = pendingBookId === book.id

          return (
            <article
              key={book.id}
              className="flex min-w-0 flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 sm:flex-row sm:gap-4 sm:rounded-2xl sm:p-4"
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
                  <h2 className="line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-100 hover:text-yellow-300 sm:text-sm sm:leading-snug">
                    {book.title}
                  </h2>
                </Link>
                <p className="mt-1 hidden line-clamp-2 text-xs text-zinc-500 sm:block">
                  {(book.authorNames ?? []).join(", ") || "Autor independiente"}
                </p>

                {membership && (
                  <span
                    className={`mt-2 w-fit rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:mt-3 sm:px-2.5 sm:py-1 sm:text-[11px] ${
                      membership.isRead
                        ? "bg-green-500/15 text-green-300"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {membership.isRead ? "Leído" : "Pendiente"}
                  </span>
                )}

                <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2 sm:gap-2 sm:pt-3">
                  {!membership ? (
                    <>
                      <button
                        type="button"
                        title="Agregar a mi biblioteca"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, false)}
                        aria-label={`Agregar ${book.title} a mi biblioteca`}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-yellow-500 px-1 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                      >
                        <AddToLibraryIcon />
                      </button>
                      <button
                        type="button"
                        title="Agregar como leído"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, true)}
                        aria-label={`Marcar ${book.title} como leído`}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-green-600 px-1 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        <BookOpenCheck size={14} />
                        {/* El texto largo anterior se compacta para que las
                            acciones quepan en la cuadrícula densa. */}
                        {/* Ya lo leí */}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          title={membership.isRead ? "Marcar pendiente" : "Marcar leído"}
                          aria-label={membership.isRead
                            ? `Marcar ${book.title} como pendiente`
                            : `Marcar ${book.title} como leído`}
                          disabled={isPending || libraryLoading}
                          onClick={() => saveBook(book.id, !membership.isRead)}
                          className="inline-flex min-w-0 items-center justify-center rounded-lg bg-zinc-700 px-1 py-2 text-xs font-medium transition hover:bg-zinc-600 disabled:opacity-50"
                        >
                          <BookOpenCheck size={14} />
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
