import { books } from "@/data/books"

export default async function Page({ params }: any) {
  const { slug } = await params

  const book = books.find(b => b.slug === slug)

  if (!book) return <div>No encontrada</div>

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto text-zinc-100">

      <img src={book.cover} className="w-48 mb-6 rounded-lg" />

      <h1 className="text-3xl font-bold">
        {book.review.title}
      </h1>

      <p className="text-yellow-400 mt-2">
        ⭐ {book.review.rating}
      </p>

      <p className="mt-6 text-zinc-300 leading-relaxed">
        {book.review.content}
      </p>

    </section>
  )
}