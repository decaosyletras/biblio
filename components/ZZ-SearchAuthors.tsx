"use client"

import { useState } from "react"
import { authors } from "@/data/authors"
import Link from "next/link"

export default function SearchAuthors() {
  const [query, setQuery] = useState("")

  const filtered = authors.filter(author =>
    author.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-6 mb-10">

      <input
        type="text"
        placeholder="Buscar autores..."
        className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-100 outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

          {filtered.map(author => (
            <Link key={author.slug} href={`/autores/${author.slug}`}>
              
              <div className="bg-zinc-800 p-4 rounded-xl text-center hover:scale-105 transition">

                <img
                  src={author.avatar}
                  className="w-16 h-16 rounded-full mx-auto"
                />

                <p className="mt-2 text-zinc-100 text-sm">
                  {author.name}
                </p>

              </div>

            </Link>
          ))}

        </div>
      )}

    </div>
  )
}