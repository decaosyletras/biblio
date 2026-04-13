import { books } from "@/data/books"
import CardReview from "@/components/CardReview"

export default function Page() {
  return (
    <section className="py-16 px-6">

      <h1 className="text-3xl font-semibold text-zinc-100 mb-10">
        Mis reseñas
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        {books.map(book => (
          <CardReview key={book.slug} book={book} />
        ))}

      </div>

    </section>
  )
}