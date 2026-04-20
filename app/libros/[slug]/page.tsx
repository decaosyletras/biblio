import { books } from "@/data/books"
import { authors } from "@/data/authors"

import { getRecommendedBooks } from "@/lib/recommendations"
import BookRow from "@/components/BookRow"

import { genresCatalog } from "@/data/genres"
import { tagsCatalog } from "@/data/tags"
import TagBadge from "@/components/TagBadge"

export default async function Page({ params }: any) {
  const { slug } = await params
  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrado</div>

  const author = authors.find(a => a.slug === book.authorSlug)

  const recommended = getRecommendedBooks(book, books)

  const genreData = genresCatalog.find(g => g.id === book.genre)

  const subgenres = genreData?.subgenres.filter(s =>
    book.subgenres.includes(s.id)
  ) || []

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

          {/* 📚 GÉNERO */}
          <p className="text-sm text-zinc-400 mt-2">
            {genreData?.label}
            {subgenres.length > 0 && (
              <> • {subgenres.map(s => s.label).join(", ")}</>
            )}
          </p>

          {/* 🏷️ ETIQUETAS */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(book.tags).map(([key, value]) => {

              const text = tagsCatalog[key as keyof typeof tagsCatalog][value]

              return (
                <TagBadge
                  key={key}
                  label={key}
                  level={value}
                  text={text}
                />
              )
            })}
          </div>

          {/* Descripción fake */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              ¿Para quién es?
            </h3>

            <p className="text-zinc-400">
              Una historia intensa que explora emociones profundas y personajes complejos.
            </p>
          </div>

          <a
            href={book.amazonLink}
            target="_blank"
            className="inline-block mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full hover:bg-yellow-300 transition"
          >
            Comprar en Amazon
          </a>

        </div>

      </div>
      <div className="mt-12">
        <BookRow title="También te puede gustar" books={recommended} />
      </div>
    </section>
  )
}