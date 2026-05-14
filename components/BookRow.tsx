"use client"

import { useRef } from "react"
import { Book } from "@/types"
import CardBook from "./CardBook"
import { shuffleArray } from "@/lib/shuffle"

export default function BookRow({
  title,
  books,
  noShuffle = false,
}: {
  title: string
  books: Book[]
  noShuffle?: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const randomBooks = shuffleArray(books)
  const displayedBooks = noShuffle
  ? books
  : shuffleArray(books)

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return
    const amount = 300
    rowRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <div className="mb-14 relative group">

      {/* Título */}
      <h2 className="text-xl font-semibold text-zinc-100 mb-4 px-6">
        {title}
      </h2>

      {/* Botón izquierda */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ◀
      </button>

      {/* Fila */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto px-2 scroll-smooth scrollbar-hide"
      >

      {displayedBooks.map((book: any) => (
        <div
          key={book.slug}
          className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[180px]"
        >

          {/*<div className="text-xs text-zinc-400 mb-1 px-1">
            ⭐ Score: {book.score}
          </div>*/}

          <CardBook book={book} />
        </div>
      ))}
                  
      </div>

      {/* Botón derecha */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ▶
      </button>

    </div>
  )
}