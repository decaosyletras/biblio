"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, Eye, EyeOff, LibraryBig, Plus, Search, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

type DirectoryFilter = "all" | "library" | "read" | "hidden"

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
  const [filter, setFilter] = useState<DirectoryFilter>("all")
  const {
    user,
    userLoading,
    library,
    hiddenBooks,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    removeBook,
    hideBook,
    restoreBook,
  } = useReaderLibrary()

  const libraryCount = books.filter((book) => Boolean(library[book.id])).length
  const readCount = books.filter((book) => library[book.id]?.isRead).length
  const hiddenCount = books.filter((book) => hiddenBooks[book.id]).length

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es")

    return books.filter((book) => {
      const membership = library[book.id]
      const isHidden = hiddenBooks[book.id] === true
      const matchesFilter =
        (filter === "all" && !isHidden) ||
        (filter === "library" && Boolean(membership) && !isHidden) ||
        (filter === "read" && membership?.isRead === true && !isHidden) ||
        (filter === "hidden" && isHidden)

      if (!matchesFilter) return false
      if (!normalizedQuery) return true

      const searchable = [
        book.title,
        ...(book.authorNames ?? []),
      ]
        .join(" ")
        .toLocaleLowerCase("es")

      return searchable.includes(normalizedQuery)
    })
  }, [books, filter, hiddenBooks, library, query])

  const filters: Array<{
    value: DirectoryFilter
    label: string
    count: number
  }> = [
    { value: "all", label: "Todos", count: books.length - hiddenCount },
    { value: "library", label: "Mi biblioteca", count: libraryCount },
    { value: "read", label: "Leídos", count: readCount },
    { value: "hidden", label: "Ocultos", count: hiddenCount },
  ]

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

      {!userLoading && user && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map(({ value, label, count }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs transition ${
                filter === value
                  ? "bg-yellow-500 font-semibold text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {label} · {count}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-zinc-500">
        {visibleBooks.length} {visibleBooks.length === 1 ? "libro" : "libros"}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 text-[10px] leading-tight text-zinc-300 sm:hidden">
        <p className="col-span-3 text-zinc-400">
          Presiona un botón para elegir qué hacer con el libro:
        </p>
        <span className="flex min-w-0 flex-col items-center gap-1 text-center">
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg bg-yellow-500 px-1 text-black">
            <AddToLibraryIcon />
          </span>
          Agregar a biblioteca
        </span>
        <span className="flex min-w-0 flex-col items-center gap-1 text-center">
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg bg-green-600 text-white">
            <BookOpenCheck size={14} aria-hidden="true" />
          </span>
          Agregar como leído
        </span>
        <span className="flex min-w-0 flex-col items-center gap-1 text-center">
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg bg-zinc-700 text-zinc-200">
            <EyeOff size={14} aria-hidden="true" />
          </span>
          Ocultar
        </span>
      </div>

      {/* En celular se muestran dos portadas verticales para que las acciones
          tengan suficiente separación y sean fáciles de tocar. Desde sm
          regresan las tarjetas horizontales y el ancho disponible permite
          crecer progresivamente hasta seis columnas. */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {visibleBooks.map((book) => {
          const membership = library[book.id]
          const isHidden = hiddenBooks[book.id] === true
          const isPending = pendingBookId === book.id
          const authorNames = book.authorNames ?? []
          const visibleAuthorNames = authorNames.slice(0, 2)
          const remainingAuthors = Math.max(0, authorNames.length - 2)

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
                <p
                  title={authorNames.join(", ") || "Autor independiente"}
                  className="mt-1 hidden h-8 line-clamp-2 text-xs text-zinc-500 sm:block"
                >
                  {visibleAuthorNames.join(", ") || "Autor independiente"}
                  {remainingAuthors > 0 && (
                    <span className="whitespace-nowrap text-zinc-400">
                      {` (+${remainingAuthors})`}
                    </span>
                  )}
                </p>

                {isHidden ? (
                  <span className="mt-2 w-fit rounded-full bg-zinc-700 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 sm:mt-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
                    Oculto
                  </span>
                ) : membership && (
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

                <div className="mt-auto grid grid-cols-3 gap-1.5 pt-2 sm:gap-2 sm:pt-3">
                  {isHidden ? (
                    <>
                      <button
                        type="button"
                        title="Volver a mostrar"
                        aria-label={`Volver a mostrar ${book.title}`}
                        disabled={isPending || libraryLoading}
                        onClick={() => restoreBook(book.id)}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-zinc-700 px-1 py-2 text-zinc-100 transition hover:bg-zinc-600 disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        title="Agregar a mi biblioteca"
                        aria-label={`Agregar ${book.title} a mi biblioteca`}
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, false)}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-yellow-500 px-1 py-2 text-black transition hover:bg-yellow-400 disabled:opacity-50"
                      >
                        <AddToLibraryIcon />
                      </button>
                      <button
                        type="button"
                        title="Agregar como leído"
                        aria-label={`Agregar ${book.title} como leído`}
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, true)}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-green-600 px-1 py-2 text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        <BookOpenCheck size={14} />
                      </button>
                    </>
                  ) : !membership ? (
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
                      <button
                        type="button"
                        title="No me interesa"
                        aria-label={`Ocultar ${book.title}`}
                        disabled={isPending || libraryLoading}
                        onClick={() => hideBook(book.id)}
                        className="inline-flex min-w-0 items-center justify-center rounded-lg bg-zinc-700 px-1 py-2 text-zinc-200 transition hover:bg-zinc-600 disabled:opacity-50"
                      >
                        <EyeOff size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="col-span-3 grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2">
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
          {filter === "hidden" && !query
            ? "No has ocultado ningún libro."
            : "No encontramos libros con esa búsqueda o filtro."}
        </div>
      )}
    </div>
  )
}
