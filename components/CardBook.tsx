import Link from "next/link"
import { Book } from "@/types"
import { authors } from "@/data/authors"
import { getBookCover } from "@/lib/amazon"
import CoverImage from "@/components/CoverImage"
import AmazonButton from "@/components/AmazonButton"

export default function CardBook({ book }: { book: Book }) {

  // 👇 multi-autor
  const bookAuthors = authors.filter(a =>
    book.authorSlug?.includes(a.slug)
  )

  return (
    <div className="bg-zinc-800 rounded-xl p-3 hover:scale-108 transition duration-300 relative z-10 hover:z-20">

      <Link href={`/libros/${book.slug}`}>
        {/* Imagen */}
        <div className="w-full h-38 sm:h-50 md:h-62 overflow-hidden rounded-lg">
          <CoverImage
            src={getBookCover(book.amazon, book.cover)}
            alt={book.title}
            className="w-full h-full object-cover rounded-xl"
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
        <h4 className="mt-4 text-[10px] sm:text-[12px] font-medium tracking-wide text-zinc-200 line-clamp-2">
          {book.title}
        </h4>
      </Link>

      {/* Autor (multi-autor) */}
      <div className="mt-1 text-xs text-zinc-400">
        {bookAuthors.map(a => a.name).join(", ")}
      </div>

      {/* Botón */}
      <AmazonButton
        amazon={book.amazon}
        amazonLink={book.amazonLink}
      />

    </div>
  )
}