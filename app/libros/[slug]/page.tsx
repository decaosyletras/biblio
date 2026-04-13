import { books } from "@/data/books"
import { authors } from "@/data/authors"

import { getRecommendedBooks } from "@/lib/recommendations"
import BookRow from "@/components/BookRow"

export default async function Page({ params }: any) {
  const { slug } = await params
  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrado</div>

  const author = authors.find(a => a.slug === book.authorSlug)

  const recommended = getRecommendedBooks(book, books)

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-zinc-100">

        {/* Imagen */}
        <img src={book.cover} className="rounded-xl" />

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>

          <p className="text-blue-400 mt-2">
            {author?.name}
          </p>

          <a
            href={book.amazonLink}
            target="_blank"
            className="inline-block mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full hover:bg-yellow-300 transition"
          >
            Comprar en Amazon
          </a>

          {/* Descripción fake */}
          <p className="mt-6 text-zinc-400">
            Una historia intensa que explora emociones profundas y personajes complejos.
          </p>
        </div>

      </div>
      <BookRow title="También te puede gustar" books={recommended} />
    </section>
  )
}