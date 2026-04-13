import Link from "next/link"
import { Book } from "@/types"
import { authors } from "@/data/authors"

export default function CardBook({ book }: { book: Book }) {
  const author = authors.find(a => a.slug === book.authorSlug)

  return (
    <div className="bg-zinc-800 rounded-xl p-3 transform hover:scale-110 hover:z-20 transition duration-300">

      {/* Imagen */}
      <div className="w-full h-56 overflow-hidden rounded-lg">
        <img
          src={book.cover}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* Info */}
      <h3 className="mt-4 text-sm font-semibold text-zinc-100 line-clamp-2">
        {book.title}
      </h3>

      {/* Autor */}
      <Link
        href={`/autores/${author?.slug}`}
        className="block mt-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
      >
        {author?.name}
      </Link>

      {/* Ver más */}
      <Link
        href={`/libros/${book.slug}`}
        className="block mt-2 text-xs text-blue-400 hover:underline"
      >
        Ver más
      </Link>

      {/* Botón */}
      <a
        href={book.amazonLink}
        target="_blank"
        className="block mt-3 text-center bg-yellow-400 text-black text-sm py-2 rounded-full hover:bg-yellow-300 transition"
      >
        Ver en Amazon
      </a>

    </div>
  )
}