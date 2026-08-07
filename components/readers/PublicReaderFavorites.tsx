import Link from "next/link"
import { Heart } from "lucide-react"
import CoverImage from "@/components/CoverImage"
import LectometerMark from "@/components/LectometerMark"
import { getBookCover } from "@/lib/amazon"
import type { PublicReaderBook } from "@/lib/readerLibrary"

export default function PublicReaderFavorites({
  library,
}: {
  library: PublicReaderBook[]
}) {
  const favorites = library
    .filter((item) => item.isRead && item.isFavorite)
    .sort((a, b) => {
      if (!a.favoritedAt) return 1
      if (!b.favoritedAt) return -1
      return b.favoritedAt.localeCompare(a.favoritedAt)
    })
    .slice(0, 6)

  if (favorites.length === 0) return null

  return (
    <section className="mt-8 rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-950/30 via-zinc-900/70 to-zinc-900/60 p-6 sm:p-9">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-300">
          <Heart fill="currentColor" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Sus favoritos</h2>
          <p className="text-sm text-zinc-500">
            Lecturas especiales para este lector
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {favorites.map(({ book }) => (
          <Link
            key={book.id}
            href={`/libros/${book.slug}`}
            className="group min-w-0"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 shadow-lg shadow-black/20 ring-1 ring-white/5">
              <CoverImage
                src={getBookCover(book.amazon, book.cover)}
                alt={book.title}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              />
              {book.review?.title && <LectometerMark />}
              <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                <Heart size={14} fill="currentColor" aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-zinc-300 group-hover:text-rose-200 sm:text-xs">
              {book.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  )
}
