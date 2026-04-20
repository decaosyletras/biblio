import { books } from "@/data/books"
import { getReviewScore } from "@/lib/getReviewScore"
import ReviewMetrics from "@/components/ReviewMetrics"
import ReviewGenres from "@/components/ReviewGenres"

export default async function Page({ params }: any) {
  const { slug } = await params

  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrada</div>

  // 🔥 promedio real (0–10)
  const score = getReviewScore(book.review.metrics)

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto text-zinc-100">

      {/* portada */}
      <img
        src={book.cover}
        className="w-48 mb-6 rounded-lg"
      />

      {/* título reseña */}
      <h1 className="text-3xl font-bold">
        {book.review.title}
      </h1>

      {/* 🔥 SCORE */}
      {/*<p className="text-4xl font-bold text-yellow-400 mt-4">
        {score}/10
      </p>*/}

      {/* 🔥 MÉTRICAS VISUALES */}
      <ReviewMetrics metrics={book.review.metrics} />

      {/* 🔥 GÉNEROS */}
      <ReviewGenres genre={book.genre} />

      {/* contenido */}
      <p className="mt-6 text-zinc-300 leading-relaxed">
        {book.review.content}
      </p>

    </section>
  )
}