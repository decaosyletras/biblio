import { books } from "@/data/books"
import CardReview from "@/components/CardReview"
import SearchOverlay from "@/components/SearchOverlay"

export default function Page() {
  return (
    <section className="py-16 px-6">
      
      <h1 className="text-3xl font-semibold text-zinc-100 mb-10">
        Mis reseñas
      </h1>
      <h4 className="font-semibold text-zinc-100">
        Sección personal: estas no son calificaciones “correctas”. Es simplemente cómo yo experimenté cada libro según mis gustos.
      </h4>
      
      <SearchOverlay
        placeholder="Buscar reseñas..."
        data={books}
        type="reviews"
      />

      <div className="grid md:grid-cols-3 gap-8">

        {books.map(book => (
          <CardReview key={book.slug} book={book} />
        ))}

      </div>

    </section>
  )
}