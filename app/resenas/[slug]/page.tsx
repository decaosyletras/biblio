import { reviews } from "@/data/reviews"

export default function Page({ params }: any) {
  const review = reviews.find(r => r.slug === params.slug)

  if (!review) return <div>No encontrado</div>

  return (
    <div className="p-10">
      <h1>{review.title}</h1>
    </div>
  )
}