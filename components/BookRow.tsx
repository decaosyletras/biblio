"use client"

import { useRef } from "react"
import { Book } from "@/types"
import CardBook from "./CardBook"
import { shuffleArray } from "@/lib/shuffle"

export default function BookRow({
  keyCategory,
  title,
  books,
}: {
  keyCategory: number
  title: string
  books: Book[]
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const randomBooks = shuffleArray(books)

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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ◀
      </button>

      {/* Fila */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto px-6 scroll-smooth scrollbar-hide"
      >

      {randomBooks.map(book => (
        <div key={book.slug} className="flex-shrink-0 w-[180px]">
          <CardBook book={book} />
        </div>
      ))}
                  
      </div>

      {/* Botón derecha */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 px-3 py-6 opacity-0 group-hover:opacity-100 transition"
      >
        ▶
      </button>

    </div>
  )
}