import Link from "next/link"
import { Book } from "@/types"
import { authors } from "@/data/authors"

export default function CardBook({ book }: { book: Book }) {
  const author = authors.find(a => a.slug === book.authorSlug)

  return (
    <div className="bg-zinc-800 rounded-xl p-3 hover:scale-108 transition duration-300 relative z-10 hover:z-20">

      <Link href={`/libros/${book.slug}`}>
        {/* Imagen */}
        <div className="w-full h-62 overflow-hidden rounded-lg">
          <img
            src={book.cover}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
          
          {book.review?.title && (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-50 pointer-events-none">
              <div className="absolute top-4 right-[-34px] rotate-45 bg-green-500 text-white text-[10px] font-bold px-10 py-1 shadow-md whitespace-nowrap">
                LEÍDO
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="mt-4 text-sm font-semibold text-zinc-100 line-clamp-2">
          {book.title}
        </h3>
      </Link>

      {/* Autor */}
      {/*<Link
        href={`/autores/${author?.slug}`}
        className="block mt-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
      >
        {author?.name}
      </Link>*/}

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