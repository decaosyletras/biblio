"use client"

import { useEffect, useRef, useState } from "react"
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

  // 👇 SSR y primer render usan EXACTAMENTE el mismo array
  const [displayedBooks, setDisplayedBooks] = useState(books)

  // 👇 shuffle SOLO después de hidratar
  useEffect(() => {
    if (!noShuffle) {
      setDisplayedBooks(shuffleArray(books))
    }
  }, [books, noShuffle])

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return

    rowRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    })
  }

  return (
    <div className="mb-14 relative group">
      <h2 className="text-xl font-semibold text-zinc-100 mb-4 px-6">
        {title}
      </h2>

      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ◀
      </button>

      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto px-2 scroll-smooth scrollbar-hide"
      >
        {displayedBooks.map((book) => (
          <div
            key={book.slug}
            className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[180px]"
          >
            <CardBook book={book} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ▶
      </button>
    </div>
  )
}