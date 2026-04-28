import { books } from "@/data/books"
import { authors } from "@/data/authors"

import { getRecommendedBooks } from "@/lib/recommendations"
import BookRow from "@/components/BookRow"

import { genresCatalog } from "@/data/genres"
import { tagsCatalog } from "@/data/tags"
import TagBadge from "@/components/TagBadge"

import GenreBadge from "@/components/GenreBadge"
import TagBar from "@/components/TagBar"
import { metricsCatalog } from "@/data/metrics"
import { div } from "framer-motion/client"

export default async function Page({ params }: any) {
  const { slug } = await params
  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrado</div>

  const author = authors.find(a => a.slug === book.authorSlug)

  const recommended = getRecommendedBooks(book.slug)

  /*const genresData =
  genresCatalog.filter(g => book.genre.includes(g.id))*/

  const genreData = genresCatalog.find(g => book.genre.includes(g.id));

  const subgenres = genreData?.subgenres.filter(s =>
    book.subgenres.includes(s.id)
  ) || []

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-zinc-100">

        {/* Imagen */}
        <div className="relative w-fit mx-auto">
          <img src={book.cover} className="rounded-xl" />

          {book.review.title && (
            <p className="mt-10 text-lg text-zinc-300 italic text-center">
              "{book.review.title}"
            </p>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>

          <p className="text-blue-400 mt-2">
            {author?.name}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {/* género */}
            {genreData && (
              <GenreBadge
                label={genreData.label}
                type={genreData.id}
              />
            )}

            {/* subgéneros */}
            {subgenres.map(s => (
              <GenreBadge
                key={s.id}
                label={s.label}
                type={genreData?.id || ""}
              />
            ))}

          </div>

          {/* Descripción */}
          {book.summary !== "" && (
            <div className="mt-2">
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                ¿De qué va?
              </h3>

              <p className="text-zinc-400">
                {book.summary}
              </p>
            </div>
          )}

          {book.review.title !== "" ? (
            <div className="mt-6">
              <span className="text-xs px-3 py-1 rounded-full bg-green-600">
                  ✓ Leído
              </span>
            </div>
          ):(
            <div className="mt-6">
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-700">
                  Pendiente
                </span>
            </div>
          )}

          {book.review.metrics?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-zinc-200 mb-3">
                ¿Qué encontrarás?
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.review.metrics.map((m) => {
                  const meta = metricsCatalog.find(x => x.id === m);
                  if (!meta) return null;

                  return (
                    <span
                      key={m}
                      className="text-xs px-3 py-1 rounded-full 
                        bg-zinc-900 
                        text-yellow-400 
                        border border-yellow-500/40 
                        shadow-[0_0_8px_rgba(234,179,8,0.25)] 
                        hover:shadow-[0_0_12px_rgba(234,179,8,0.4)] 
                        hover:bg-zinc-800 
                        transition-all duration-200"
                    >
                      {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {Object.entries(book.tags)
            .filter(([_, value]) => value !== 0)
            .map(([key, value]) => {
              const text = tagsCatalog[key as keyof typeof tagsCatalog][value]
              return (
                <TagBar
                  key={key}
                  label={key}
                  level={value}
                  text={text}
                />
              )
            })}
          </div>

          {/* Reseña */}
          {book.review.excerpt !== "" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                ¿Para quién es?
              </h3>

              <p className="text-zinc-400">
                {book.review.excerpt}
              </p>
            </div>
          )}

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