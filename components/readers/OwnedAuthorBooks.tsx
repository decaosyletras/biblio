"use client"

import Link from "next/link"
import { BookCopy, ExternalLink, Pencil } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import type { ReaderOwnedAuthor } from "@/hooks/useReaderLibrary"
import { getBookCover } from "@/lib/amazon"
import type { DatabaseBook } from "@/types"

export default function OwnedAuthorBooks({
  books,
  authors,
}: {
  books: DatabaseBook[]
  authors: ReaderOwnedAuthor[]
}) {
  if (authors.length === 0) return null

  const primaryAuthor = authors[0]

  return (
    <section className="mb-10 rounded-3xl border border-blue-500/25 bg-blue-500/5 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-300">
            <BookCopy size={18} aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-[0.14em]">
              Mi espacio de autor
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100 sm:text-2xl">
            Mis libros publicados
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Estas obras pertenecen a tu perfil de autor y se mantienen separadas
            de tus lecturas personales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/authors/${primaryAuthor.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Ver perfil
          </Link>
          <Link
            href={`/authors/${primaryAuthor.slug}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Pencil size={15} aria-hidden="true" />
            Administrar
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">
          Todavía no hay libros publicados asociados con tu perfil.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/libros/${book.slug}`}
              className="group min-w-0 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2 transition hover:border-blue-500/40"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800">
                <CoverImage
                  src={getBookCover(book.amazon, book.cover, book.coverSource)}
                  alt={book.title}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-zinc-200 group-hover:text-blue-300">
                {book.title}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300">
                Tu libro
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
