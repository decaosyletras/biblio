"use client"

import { BookOpenCheck, Check, LibraryBig } from "lucide-react"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"

export default function BookLibraryActions({ bookId }: { bookId: string }) {
  const {
    userLoading,
    library,
    libraryLoading,
    pendingBookId,
    message,
    saveBook,
  } = useReaderLibrary()
  const membership = library[bookId]
  const isPending = pendingBookId === bookId
  const isLoading = userLoading || libraryLoading
  const isInLibrary = Boolean(membership)
  const isRead = membership?.isRead === true

  return (
    <div className="mt-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isLoading || isPending || isInLibrary}
          onClick={() => saveBook(bookId, false)}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-default ${
            isInLibrary
              ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              : "border-zinc-700 bg-zinc-800 text-zinc-100 hover:border-yellow-500/60 hover:bg-zinc-700 disabled:opacity-60"
          }`}
        >
          {isInLibrary ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <LibraryBig size={18} aria-hidden="true" />
          )}
          {isLoading
            ? "Cargando biblioteca..."
            : isInLibrary
              ? "En mi biblioteca"
              : isPending
                ? "Agregando..."
                : "Agregar a mi biblioteca"}
        </button>

        <button
          type="button"
          disabled={isLoading || isPending || isRead}
          onClick={() => saveBook(bookId, true)}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-default ${
            isRead
              ? "bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-500/30"
              : "bg-green-600 text-white hover:bg-green-500 disabled:opacity-60"
          }`}
        >
          {isRead ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <BookOpenCheck size={18} aria-hidden="true" />
          )}
          {isLoading
            ? "Cargando biblioteca..."
            : isRead
              ? "Marcado como leído"
              : isPending
                ? "Guardando..."
                : "Marcar como leído"}
        </button>
      </div>

      {message && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {message}
        </p>
      )}
    </div>
  )
}
