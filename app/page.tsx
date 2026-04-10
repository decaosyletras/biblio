import CardReview from "@/components/CardReview"
import { reviews } from "@/data/reviews"

export default function Home() {
  return (
    <main>
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold">Descubre algo hoy</h1>
      </section>

      <section className="grid md:grid-cols-3 gap-6 px-10">
        {reviews.map(r => (
          <CardReview key={r.slug} review={r} />
        ))}
      </section>
    </main>
  )
}