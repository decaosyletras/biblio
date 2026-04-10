import CardReview from "@/components/CardReview"
import { reviews } from "@/data/reviews"

export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Descubre tu próxima lectura favorita
          </h1>

          <p className="mt-6 text-gray-500">
            Reseñas rápidas, directas y autores independientes que valen la pena.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="bg-black text-white px-8 py-3 rounded-full hover:scale-105 transition">
              Explorar reseñas
            </button>

            <button className="border px-8 py-3 rounded-full hover:bg-gray-100 transition">
              Ver mis libros
            </button>
          </div>

        </div>
      </section>

      {/* RESEÑAS */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-2xl font-semibold mb-10">
            Últimas reseñas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {reviews.map(r => (
              <CardReview key={r.slug} review={r} />
            ))}
          </div>

        </div>
      </section>

    </main>
  )
}