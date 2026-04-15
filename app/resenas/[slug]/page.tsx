import { books } from "@/data/books"
import { getReviewScore } from "@/lib/getReviewScore"
import ReviewMetrics from "@/components/ReviewMetrics"
import ReviewGenres from "@/components/ReviewGenres"

export default async function Page({ params }: any) {
  const { slug } = await params

  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrada</div>

  const score = <ReviewGenres genres={book.genres} />

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto text-zinc-100">

      <img src={book.cover} className="w-48 mb-6 rounded-lg" />

      <h1 className="text-3xl font-bold">
        {book.review.title}
      </h1>

      <div className="mt-4 space-y-2">
        {Object.entries(book.review.metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="capitalize text-zinc-400">
              {key}
            </span>
            <span className="text-zinc-100">
              {value}/5
            </span>
          </div>
        ))}
      </div>
      <p className="text-4xl font-bold text-yellow-400 mt-6">
      {score} promedio
      </p>

      <p className="mt-6 text-zinc-300 leading-relaxed">
        {book.review.content}
      </p>

    </section>
  )
}