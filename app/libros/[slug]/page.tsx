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
import CoverImage from "@/components/CoverImage"
import AmazonButton from "@/components/AmazonButton"
import { getBookCover } from "@/lib/amazon"

export default async function Page({ params }: any) {
  const { slug } = await params
  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrado</div>

  // 👇 AUTORES (multi-autor)
  const bookAuthors = authors.filter(a =>
    book.authorSlug.includes(a.slug)
  )

  const recommended = getRecommendedBooks(book.slug)

  const sameAuthorBooks = books.filter(
    b =>
      b.slug !== book.slug &&
      b.authorSlug?.some(slug => book.authorSlug.includes(slug))
  )

  const genresData = genresCatalog.filter(g =>
    book.genre.includes(g.id)
  )

  const subgenres = genresData.flatMap(g =>
    g.subgenres.filter(s => book.subgenres.includes(s.id))
  )

  const getGenreFromSubgenre = (subId: string) => {
    return genresCatalog.find(g =>
      g.subgenres.some(s => s.id === subId)
    )?.id
  }

  return (
    <section className="py-14">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-zinc-100">

        {/* Imagen */}
        <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[240px] md:max-w-xs">
          <CoverImage
            src={getBookCover(book.amazon, book.cover)}
            alt={book.title}
            className="w-full aspect-[2/3] object-cover rounded-xl"
          />

          {book.review.title && (
            <p className="mt-8 text-lg text-zinc-300 italic text-center">
              "{book.review.title}"
            </p>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>

          {/* 👇 autores (multi) */}
          <p className="text-blue-400 mt-2">
            {bookAuthors.map(a => a.name).join(", ")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {/* género */}
            {genresData.map(g => (
              <GenreBadge
                key={g.id}
                label={g.label}
                type={g.id}
              />
            ))}

            {/* subgéneros */}
            {subgenres.map(s => (
              <GenreBadge
                key={s.id}
                label={s.label}
                type={getGenreFromSubgenre(s.id) || ""}
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

          <div className="mt-6 flex flex-wrap gap-2">

            {/* Estado */}
            {book.review.title !== "" ? (
              <span className="text-xs px-3 py-1 rounded-full bg-green-600">
                ✓ Leído
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-700">
                Pendiente
              </span>
            )}

            {/* Saga */}
            {book.isSaga ? (
              <span
                className="text-xs px-3 py-1 rounded-full
                bg-purple-500/20
                text-purple-300
                border border-purple-400/30"
              >
                📚 Saga
              </span>
            ) : (
              <span
                className="text-xs px-3 py-1 rounded-full
                bg-zinc-800
                text-zinc-400
                border border-zinc-700"
              >
                📖 Autoconclusivo
              </span>
            )}

          </div>

          {book.review.metrics?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-zinc-200 mb-3">
                ¿Qué encontrarás?
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.review.metrics.map((m) => {
                  const meta = metricsCatalog.find(x => x.id === m)
                  if (!meta) return null

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
                  )
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
                Ideal si buscas
              </h3>

              <div className="text-zinc-400 space-y-2">
                {book.review.excerpt
                  .split("\n")
                  .map((line, i) =>
                    line.trim() ? (
                      <p key={i} className="flex gap-2">
                        <span>•</span>
                        <span>{line}</span>
                      </p>
                    ) : null
                  )}
              </div>
            </div>
          )}

          <AmazonButton
            amazon={book.amazon}
            amazonLink={book.amazonLink}
          />

        </div>
      </div>

      {/* Más libros del mismo autor (o coautores) */}
      {sameAuthorBooks.length > 0 && (
        <div className="mt-12">
          <BookRow
            title={`Más libros de ${bookAuthors.map(a => a.name).join(", ")}`}
            books={sameAuthorBooks}
            noShuffle
          />
        </div>
      )}

      <div className="mt-12">
        <BookRow title="También te puede gustar" books={recommended} />
      </div>

    </section>
  )
}