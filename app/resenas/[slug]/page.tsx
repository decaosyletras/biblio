import { reviews } from "@/data/reviews"

export default function Page({ params }: any) {
  const review = reviews.find(r => r.slug === params.slug)

  if (!review) return <div>No encontrado</div>

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">

        <img src={review.cover} className="w-64 rounded-xl mb-6" />

        <h1 className="text-3xl font-bold">{review.title}</h1>
        <p className="text-gray-500">{review.author}</p>

        <p className="mt-4">⭐ {review.rating}</p>

        <div className="mt-10 space-y-6 text-gray-700">
          <p><strong>🎯 ¿Para quién es?</strong> Lectores curiosos.</p>
          <p><strong>📚 Libros similares</strong> Próximamente...</p>
        </div>

      </div>
    </section>
  )
}