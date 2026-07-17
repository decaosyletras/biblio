"use client"

import { useState } from "react"
import Link from "next/link"
import { getAmazonCover } from "@/lib/amazon"
import { getBookCover } from "@/lib/amazon"
import { UserRound } from "lucide-react"

export default function SearchSimple({
  data,
  type,
}: {
  data: any[]
  type: "books" | "authors" | "reviews"
}) {

  const [query, setQuery] = useState("")

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const q = normalize(query)

  const filtered = data.filter((item) => {

    if (!q) return false

    if (type === "books") {
      return normalize(item.title).includes(q)
    }

    if (type === "authors") {
      return normalize(item.name).includes(q)
    }

    if (type === "reviews") {
      return normalize(item.title).includes(q)
    }

    return false
  })

  return (
    <div className="mb-8 px-6">

      <input
        type="text"
        placeholder="Buscar..."
        className="
          w-full 
          p-4 
          rounded-xl 
          bg-zinc-800 
          text-zinc-100 
          outline-none
        "
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      {query && (
        <div className="mt-6 space-y-4">

          <div className="
            mt-6 
            space-y-4 
            max-h-[70vh] 
            overflow-y-auto
          ">

            {filtered.map((item: any) => {

            if (type === "reviews" || type === "books") {
              return (
                <Link
                  href={`/libros/${item.slug}`}
                  key={item.slug}
                >
                  <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">
                    <img
                      src={getBookCover(item.amazon, item.cover)}
                      alt={item.title}
                      className="w-12 h-24 object-cover"
                    />
                    <p>{item.title}</p>
                  </div>
                </Link>
              )
            }

            if (type === "authors") {
              return (
                <Link
                  href={`/authors/${item.slug}`}
                  key={item.id}
                >
                  <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">

                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center">
                        <UserRound className="text-zinc-400" size={24} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100 truncate">
                        {item.name}
                      </p>
                      
                    </div>

                  </div>
                </Link>
              )
            }

            return null
          })}

          </div>

          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm">
              No se encontraron resultados
            </p>
          )}

        </div>
      )}

    </div>
  )
}