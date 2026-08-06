"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Eraser,
  LoaderCircle,
} from "lucide-react"
import CoverImage from "@/components/CoverImage"
import type { ReaderLibraryState } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

type Props = {
  books: DatabaseBook[]
  library: ReaderLibraryState
  onSave: (bookIds: string[], readYear: number | null) => Promise<boolean>
}

export default function ReaderYearOrganizer({ books, library, onSave }: Props) {
  const currentYear = new Date().getFullYear()
  const [open, setOpen] = useState(false)
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(
    () => new Set()
  )
  const [year, setYear] = useState(String(currentYear))
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [saveFailed, setSaveFailed] = useState(false)

  const readBooks = useMemo(
    () => books.filter((book) => library[book.id]?.isRead),
    [books, library]
  )
  const booksWithoutYear = readBooks.filter(
    (book) => library[book.id]?.readYear === null
  )

  const toggleBook = (bookId: string) => {
    setConfirmation("")
    setSelectedBookIds((current) => {
      const next = new Set(current)
      if (next.has(bookId)) next.delete(bookId)
      else next.add(bookId)
      return next
    })
  }

  const saveYear = async (nextYear: number | null) => {
    if (selectedBookIds.size === 0) return

    setSaving(true)
    setConfirmation("")
    setSaveFailed(false)

    const selectedCount = selectedBookIds.size
    const saved = await onSave([...selectedBookIds], nextYear)

    if (saved) {
      setSelectedBookIds(new Set())
      setConfirmation(
        nextYear === null
          ? `Se quitó el año de ${selectedCount} ${
              selectedCount === 1 ? "lectura" : "lecturas"
            }.`
          : `Se asignó ${nextYear} a ${selectedCount} ${
              selectedCount === 1 ? "lectura" : "lecturas"
            }.`
      )
    } else {
      setSaveFailed(true)
      setConfirmation("No se pudo guardar el año. Inténtalo nuevamente.")
    }

    setSaving(false)
  }

  const parsedYear = Number(year)
  const validYear =
    Number.isInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= currentYear

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-green-500/20 bg-green-950/20">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-300">
            <CalendarDays size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">
              Organiza tus lecturas por año
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Asigna el año cuando quieras para poder crear tu resumen anual.
              Es completamente opcional.
            </p>
            {booksWithoutYear.length > 0 && (
              <p className="mt-2 text-xs font-medium text-green-300">
                {booksWithoutYear.length}{" "}
                {booksWithoutYear.length === 1
                  ? "lectura sin año"
                  : "lecturas sin año"}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-200 transition hover:bg-green-500/15"
        >
          {open ? "Cerrar" : "Organizar por año"}
          {open ? (
            <ChevronUp size={17} aria-hidden="true" />
          ) : (
            <ChevronDown size={17} aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-green-500/15 bg-zinc-950/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-300">
              Selecciona uno o varios libros leídos.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {booksWithoutYear.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBookIds(
                      new Set(booksWithoutYear.map((book) => book.id))
                    )
                  }
                  className="rounded-full bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:bg-zinc-700"
                >
                  Seleccionar sin año
                </button>
              )}
              {selectedBookIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBookIds(new Set())}
                  className="rounded-full bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:bg-zinc-700"
                >
                  Limpiar selección
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {readBooks.map((book) => {
              const selected = selectedBookIds.has(book.id)
              const readYear = library[book.id]?.readYear

              return (
                <label
                  key={book.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition ${
                    selected
                      ? "border-yellow-400/60 bg-yellow-400/10"
                      : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleBook(book.id)}
                    className="sr-only"
                  />
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    <CoverImage
                      src={getBookCover(book.amazon, book.cover)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                      {book.title}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        readYear ? "text-green-300" : "text-zinc-500"
                      }`}
                    >
                      {readYear ?? "Sin año asignado"}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      selected
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-zinc-600 text-transparent"
                    }`}
                  >
                    <Check size={15} />
                  </span>
                </label>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="mb-2 block text-xs font-medium text-zinc-400">
                Año de lectura
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1900}
                max={currentYear}
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-zinc-100 outline-none focus:border-yellow-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => saveYear(null)}
                disabled={saving || selectedBookIds.size === 0}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eraser size={16} aria-hidden="true" />
                Quitar año
              </button>
              <button
                type="button"
                onClick={() => saveYear(parsedYear)}
                disabled={saving || selectedBookIds.size === 0 || !validYear}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Check size={16} aria-hidden="true" />
                )}
                Guardar año
              </button>
            </div>
          </div>

          {!validYear && year !== "" && (
            <p className="mt-2 text-xs text-red-300">
              Escribe un año entre 1900 y {currentYear}.
            </p>
          )}
          {confirmation && (
            <p
              role={saveFailed ? "alert" : "status"}
              aria-live="polite"
              className={`mt-3 text-sm ${
                saveFailed ? "text-red-300" : "text-green-300"
              }`}
            >
              {confirmation}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
