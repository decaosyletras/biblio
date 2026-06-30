import { getBooks } from "@/lib/books"
import CardReview from "@/components/CardReview"
import SearchSimple from "@/components/SearchSimple"
import { shuffleArray } from "@/lib/shuffle"

export const dynamic = "force-dynamic";

const books = await getBooks()

export default function Page() {
  const randomReview = shuffleArray(books)
  return (
    <section className="py-16 px-6">
  
      <h1 className="text-3xl font-semibold text-zinc-100 mb-10">
        Lectómetro
      </h1>

      <div className="space-y-6">
        <p className="text-sm text-zinc-400 px-6 mb-6 max-w-2xl md:max-w-none">
          Lo que encontrarás aquí son opiniones basadas en criterios propios, sin influencia de pagos, colaboraciones o compensaciones.
        </p>

        <SearchSimple 
          data={books.filter(book => book.review?.title !== "")} 
          type="reviews" 
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {randomReview
          .filter(book => book.review?.title !== "")
          .map(book => (
            <CardReview key={book.slug} book={book} />
          ))}
      </div>

    </section>
  )
}