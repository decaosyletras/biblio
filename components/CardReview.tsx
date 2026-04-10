import Link from "next/link"
import { Review } from "@/types"

export default function CardReview({ review }: { review: Review }) {
  return (
    <Link href={`/resenas/${review.slug}`}>
      <div className="bg-white rounded-xl shadow hover:-translate-y-1 transition">
        <img src={review.cover} className="w-full h-48 object-cover" />

        <div className="p-4">
          <h3 className="font-semibold">{review.title}</h3>
          <p className="text-sm text-gray-500">{review.author}</p>
          <p className="text-sm mt-2 italic">"{review.excerpt}"</p>
        </div>
      </div>
    </Link>
  )
}