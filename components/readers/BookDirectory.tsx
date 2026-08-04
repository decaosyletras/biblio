"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpenCheck, LibraryBig, Search, Trash2 } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

type LibraryState = {
  isRead: boolean
}

export default function BookDirectory({
  books,
}: {
  books: DatabaseBook[]
}) {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [query, setQuery] = useState("")
  const [library, setLibrary] = useState<Record<string, LibraryState>>({})
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [pendingBookId, setPendingBookId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setLibrary({})
      setLibraryLoading(false)
      return
    }

    let active = true

    async function loadLibrary() {
      setLibraryLoading(true)
      const response = await fetch("/api/readers/books", {
        cache: "no-store",
      })

      if (!response.ok) {
        if (active) {
          setMessage("No se pudo cargar tu biblioteca.")
          setLibraryLoading(false)
        }
        return
      }

      const result = await response.json()

      if (!active) return

      const nextLibrary: Record<string, LibraryState> = {}

      for (const item of result.books ?? []) {
        if (typeof item.bookId === "string") {
          nextLibrary[item.bookId] = {
            isRead: item.isRead === true,
          }
        }
      }

      setLibrary(nextLibrary)
      setLibraryLoading(false)
    }

    loadLibrary()

    return () => {
      active = false
    }
  }, [user, userLoading])

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

  function requireSession() {
    if (user) return true

    router.push("/login")
    return false
  }

  async function saveBook(bookId: string, isRead: boolean) {
    if (!requireSession()) return

    setPendingBookId(bookId)
    setMessage("")

    try {
      const response = await fetch("/api/readers/books", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, isRead }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo actualizar tu biblioteca.")
        return
      }

      setLibrary((current) => ({
        ...current,
        [bookId]: {
          isRead: result.book?.isRead === true,
        },
      }))
    } catch {
      setMessage("No se pudo conectar con la biblioteca.")
    } finally {
      setPendingBookId(null)
    }
  }

  async function removeBook(bookId: string) {
    if (!requireSession()) return

    setPendingBookId(bookId)
    setMessage("")

    try {
      const response = await fetch("/api/readers/books", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo quitar el libro.")
        return
      }

      setLibrary((current) => {
        const next = { ...current }
        delete next[bookId]
        return next
      })
    } catch {
      setMessage("No se pudo conectar con la biblioteca.")
    } finally {
      setPendingBookId(null)
    }
  }

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
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-4 pl-12 pr-4 text-white outline-none transition focus:border-yellow-500"
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

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBooks.map((book) => {
          const membership = library[book.id]
          const isPending = pendingBookId === book.id

          return (
            <article
              key={book.id}
              className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4"
            >
              <Link
                href={`/libros/${book.slug}`}
                className="h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
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

                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {!membership ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, false)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                      >
                        <LibraryBig size={14} />
                        Agregar
                      </button>
                      <button
                        type="button"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        <BookOpenCheck size={14} />
                        Ya lo leí
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isPending || libraryLoading}
                        onClick={() => saveBook(book.id, !membership.isRead)}
                        className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium transition hover:bg-zinc-600 disabled:opacity-50"
                      >
                        {membership.isRead ? "Marcar pendiente" : "Marcar leído"}
                      </button>
                      <button
                        type="button"
                        aria-label={`Quitar ${book.title} de mi biblioteca`}
                        disabled={isPending || libraryLoading}
                        onClick={() => removeBook(book.id)}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
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
