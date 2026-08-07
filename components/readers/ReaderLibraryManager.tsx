"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, Heart, LibraryBig, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import LectometerMark from "@/components/LectometerMark"
import ReadRibbon from "@/components/readers/ReadRibbon"
import ReaderShareImageButton from "@/components/readers/ReaderShareImageButton"
import ReaderYearOrganizer from "@/components/readers/ReaderYearOrganizer"
import ReaderAchievements from "@/components/readers/ReaderAchievements"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import { getReaderRecommendations } from "@/lib/readerRecommendations"
import type { DatabaseBook } from "@/types"

type LibraryFilter = "all" | "read" | "pending"

export default function ReaderLibraryManager({
  books,
}: {
  books: DatabaseBook[]
}) {
  const {
    library,
    hiddenBooks,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
    setFavorite,
    setReadYear,
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
  const recommendations = useMemo(
    () => getReaderRecommendations({ books, library, hiddenBooks }),
    [books, hiddenBooks, library]
  )

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

      <ReaderAchievements />

      {libraryBooks.length > 0 && <ReaderShareImageButton />}

      {readCount > 0 && (
        <ReaderYearOrganizer
          books={libraryBooks}
          library={library}
          onSave={setReadYear}
        />
      )}

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
                  className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:h-40 sm:w-28 sm:aspect-auto"
                >
                  <CoverImage
                    src={getBookCover(book.amazon, book.cover)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                  {book.review?.title && <LectometerMark />}
                  {membership?.isRead && <ReadRibbon />}
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
                  {membership?.isRead && (
                    <p
                      className={`mt-1.5 text-[11px] font-medium ${
                        membership.readYear
                          ? "text-green-300"
                          : "text-zinc-500"
                      }`}
                    >
                      {membership.readYear
                        ? `Lectura de ${membership.readYear}`
                        : "Año de lectura sin asignar"}
                    </p>
                  )}

                  <div
                    className={`mt-auto grid gap-2 pt-3 sm:flex ${
                      membership?.isRead
                        ? "grid-cols-[minmax(0,1fr)_auto_auto]"
                        : "grid-cols-[minmax(0,1fr)_auto]"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveBook(book.id, !membership?.isRead)}
                      className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg bg-zinc-700 px-2 py-2 text-xs transition hover:bg-zinc-600 disabled:opacity-50 sm:gap-1.5 sm:px-3"
                    >
                      <BookOpenCheck size={14} />
                      {membership?.isRead ? "Pendiente" : "Leído"}
                    </button>
                    {membership?.isRead && (
                      <button
                        type="button"
                        aria-label={
                          membership.isFavorite
                            ? `Quitar ${book.title} de favoritos`
                            : `Marcar ${book.title} como favorito`
                        }
                        aria-pressed={membership.isFavorite}
                        disabled={isPending}
                        onClick={() =>
                          setFavorite(book.id, !membership.isFavorite)
                        }
                        className={`flex items-center justify-center rounded-lg border p-2 transition disabled:opacity-50 ${
                          membership.isFavorite
                            ? "border-rose-400/40 bg-rose-500/15 text-rose-300"
                            : "border-zinc-700 text-zinc-400 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300"
                        }`}
                      >
                        <Heart
                          size={15}
                          fill={membership.isFavorite ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                      </button>
                    )}
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

      {recommendations.length > 0 && (
        <section className="mt-12 border-t border-zinc-800 pt-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Sparkles size={19} aria-hidden="true" />
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Basado en tu biblioteca
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
                Quizá también te interesen
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Sugerencias según los géneros y el estilo de los libros que guardaste. Cuantas más elecciones hagas, más afinada será esta selección.
              </p>
            </div>
            <Link
              href="/book-directory"
              className="text-sm font-medium text-yellow-400 hover:text-yellow-300"
            >
              Ver todo el catálogo →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {recommendations.map(({ book, reason }) => {
              const isPending = pendingBookId === book.id

              return (
                <article
                  key={book.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3"
                >
                  <Link
                    href={`/libros/${book.slug}`}
                    className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800"
                  >
                    <CoverImage
                      src={getBookCover(book.amazon, book.cover)}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-200 hover:scale-105"
                    />
                    {book.review?.title && <LectometerMark />}
                  </Link>

                  <div className="flex flex-1 flex-col pt-3">
                    <Link href={`/libros/${book.slug}`}>
                      <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 hover:text-yellow-300">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                      {(book.authorNames ?? []).join(", ") || "Autor independiente"}
                    </p>
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                      {reason}
                    </p>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveBook(book.id, false)}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-3 py-2.5 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-wait disabled:opacity-50"
                    >
                      <Plus size={15} aria-hidden="true" />
                      {isPending ? "Agregando..." : "Agregar a mi biblioteca"}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
