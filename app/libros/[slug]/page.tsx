import { getBooks } from "@/lib/books"
import { getRecommendedBooks } from "@/lib/recommendations"
import BookRow from "@/components/BookRow"

import { genresCatalog } from "@/data/genres"
import { tagsCatalog } from "@/data/tags"

import GenreBadge from "@/components/GenreBadge"
import TagBar from "@/components/TagBar"
import { metricsCatalog } from "@/data/metrics"

import CoverImage from "@/components/CoverImage"
import AmazonButton from "@/components/AmazonButton"
import { getBookCover } from "@/lib/amazon"

import ClaimAuthorButton from "@/components/ClaimAuthorButton"

import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function Page({ params }: any) {
  const { slug } = await params

  const books = await getBooks()
  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrado</div>

  // 🔥 autores verificados (approved)
  const { data: approvedClaims } = await supabase
    .from("author_claims")
    .select("author_id")
    .eq("status", "approved")

  const verifiedAuthors = new Set(
    (approvedClaims ?? []).map(c => c.author_id)
  )

  const bookAuthors = book.authorNames ?? []

  const recommended = await getRecommendedBooks(book.slug)

  const sameAuthorBooks = books.filter(
    b =>
      b.slug !== book.slug &&
      b.authorNames?.some(author =>
        bookAuthors.includes(author)
      )
  )

  const genresData = genresCatalog.filter(g =>
    book.genre.includes(g.id)
  )

  const subgenres = genresData.flatMap(g =>
    g.subgenres.filter(s =>
      book.subgenres.includes(s.id)
    )
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

          <h1 className="text-3xl font-bold">
            {book.title}
          </h1>

          {/* 🔥 FIX CLAVE: authors seguro */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(book.authors ?? []).map((author) => {


              //DESCOMENTAR AL PUBLICAR
              //const isVerified = verifiedAuthors.has(author.id)
              //COMENTAR CUANDO SE PUBLIQUE
              const isVerified = false

              return isVerified ? (
                <a
                  key={author.id}
                  href={`/authors/${author.slug}`}
                  className="text-blue-400 hover:underline"
                >
                  {author.name}
                </a>
              ) : (
                <span
                  key={author.id}
                  className="text-zinc-500"
                >
                  {author.name}
                </span>
              )
            })}
          </div>

          <ClaimAuthorButton authors={book.authors ?? []} />

          {/* GENRES */}
          <div className="mt-4 flex flex-wrap gap-2">
            {genresData.map(g => (
              <GenreBadge key={g.id} label={g.label} type={g.id} />
            ))}

            {subgenres.map(s => (
              <GenreBadge
                key={s.id}
                label={s.label}
                type={getGenreFromSubgenre(s.id) || ""}
              />
            ))}
          </div>

          {/* SUMMARY */}
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

          {/* BADGES */}
          <div className="mt-6 flex flex-wrap gap-2">
            {book.review.title !== "" ? (
              <span className="text-xs px-3 py-1 rounded-full bg-green-600">
                ✓ Leído
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-700">
                Pendiente
              </span>
            )}

            {book.isSaga ? (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                📚 Saga
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                📖 Autoconclusivo
              </span>
            )}
          </div>

          {/* METRICS */}
          {book.review.metrics?.length > 0 &&
            book.review.title !== "" && (
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
                        className="text-xs px-3 py-1 rounded-full bg-zinc-900 text-yellow-400 border border-yellow-500/40"
                      >
                        {meta.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

          {/* TAGS */}
          <div className="mt-6 space-y-4">
            {Object.entries(book.tags)
              .filter(([_, value]) => value !== 0)
              .map(([key, value]) => {
                const text =
                  tagsCatalog[key as keyof typeof tagsCatalog][value]

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

          {/* EXCERPT */}
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

      {/* SAME AUTHOR */}
      {sameAuthorBooks.length > 0 && (
        <div className="mt-12">
          <BookRow
            title={`Más libros de ${bookAuthors.join(", ")}`}
            books={sameAuthorBooks}
            noShuffle
          />
        </div>
      )}

      {/* RECOMMENDED */}
      <div className="mt-12">
        <BookRow
          title="También te puede gustar"
          books={recommended}
        />
      </div>
    </section>
  )
}