"use client"

import { useState } from "react"
import { books } from "@/data/books"
import CardBook from "./CardBook"

export default function SearchBooks() {
  const [query, setQuery] = useState("")

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-6 mb-10">

      <input
        type="text"
        placeholder="Buscar libros..."
        className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-100 outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {filtered.map(book => (
            <CardBook key={book.slug} book={book} />
          ))}
        </div>
      )}

    </div>
  )
}