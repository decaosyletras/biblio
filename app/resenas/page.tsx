import { reviews } from "@/data/reviews"
import CardReview from "@/components/CardReview"

export default function Page() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Reseñas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reviews.map(r => (
          <CardReview key={r.slug} review={r} />
        ))}
      </div>
    </div>
  )
}