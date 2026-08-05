"use client"

import { BookOpenCheck, LibraryBig, Plus } from "lucide-react"
import { useReaderLibrary } from "@/hooks/useReaderLibrary"

function AddToLibraryIcon() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1" aria-hidden="true">
      <LibraryBig size={14} />
      <Plus size={11} strokeWidth={3} />
    </span>
  )
}

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
      <p className="mb-2.5 text-xs leading-relaxed text-zinc-400">
        Guarda este libro en tu biblioteca personal o marca que ya lo leíste.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          aria-label={isInLibrary ? "Este libro está en mi biblioteca" : "Agregar a mi biblioteca"}
          disabled={isLoading || isPending || isInLibrary}
          onClick={() => saveBook(bookId, false)}
          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-yellow-500 px-2 py-2.5 text-xs font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-default disabled:opacity-70 sm:px-3 sm:py-2"
        >
          <AddToLibraryIcon />
          <span className="sm:hidden">
            {isLoading ? "Cargando..." : isInLibrary ? "En biblioteca" : isPending ? "Guardando..." : "Guardar"}
          </span>
          <span className="hidden sm:inline">
            {isLoading
              ? "Cargando biblioteca..."
              : isInLibrary
                ? "En mi biblioteca"
                : isPending
                  ? "Agregando..."
                  : "Agregar a mi biblioteca"}
          </span>
        </button>

        <button
          type="button"
          aria-label={isRead ? "Este libro está marcado como leído" : "Marcar como leído"}
          disabled={isLoading || isPending || isRead}
          onClick={() => saveBook(bookId, true)}
          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-green-500 disabled:cursor-default disabled:opacity-70 sm:px-3 sm:py-2"
        >
          <BookOpenCheck size={14} aria-hidden="true" />
          <span className="sm:hidden">
            {isLoading ? "Cargando..." : isRead ? "Leído" : isPending ? "Guardando..." : "Marcar leído"}
          </span>
          <span className="hidden sm:inline">
            {isLoading
              ? "Cargando biblioteca..."
              : isRead
                ? "Marcado como leído"
                : isPending
                  ? "Guardando..."
                  : "Marcar como leído"}
          </span>
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
