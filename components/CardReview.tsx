import Link from "next/link"
import { Review } from "@/types"

export default function CardReview({ review }: { review: Review }) {
  return (
    <Link href={`/resenas/${review.slug}`}>
      <div className="group bg-zinc-800 text-zinc-100 rounded-2xl shadow rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">

        <div className="overflow-hidden">
          <img 
            src={review.cover} 
            className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg">
            {review.title}
          </h3>

          <p className="text-sm text-gray-500">{review.author}</p>

          <p className="text-sm mt-3 text-gray-600 italic">
            “{review.excerpt}”
          </p>
        </div>

      </div>
    </Link>
  )
}