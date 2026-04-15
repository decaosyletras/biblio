import Link from "next/link"
import { Book } from "@/types"
import { getReviewScore } from "@/lib/getReviewScore"

export default function CardReview({ book }: { book: Book }) {
  const score = getReviewScore(book.review.metrics)
  return (
    <Link href={`/resenas/${book.slug}`}>
      <div className="bg-zinc-800 p-5 rounded-xl hover:scale-105 transition">

        <img
          src={book.cover}
          className="w-full h-48 object-cover rounded-lg"
        />

        <h2 className="mt-4 font-semibold text-zinc-100">
          {book.review.title}
        </h2>

        <p className="text-zinc-400 text-sm mt-2">
          {book.review.excerpt}
        </p>

        {/* SCORE */}
        <p className="text-yellow-400 mt-3 text-lg font-bold">
          ⭐ {score}
        </p>
        
      </div>
    </Link>
  )
}