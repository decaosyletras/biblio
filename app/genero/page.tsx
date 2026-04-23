import { books } from "@/data/books"
import { genresCatalog } from "@/data/genres"
import Link from "next/link"

export default function Page({ params }: any) {
  const { id } = params

  const genreData = genresCatalog.find(g => g.id === id)

  if (!genreData) return <div>No encontrado</div>

  const filteredBooks = books.filter(b => b.genre === id)

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto text-zinc-100">

      <h1 className="text-3xl font-bold mb-10">
        {genreData.label}
      </h1>

      <div className="space-y-6">

        {filteredBooks.map((book) => {

          const subgenres = genreData.subgenres.filter(s =>
            book.subgenres.includes(s.id)
          )

          return (
            <Link href={`/libros/${book.slug}`} key={book.slug}>

              <div className="flex gap-4 bg-zinc-900 p-4 rounded-xl hover:bg-zinc-800 transition">

                <img
                  src={book.cover}
                  className="w-24 h-36 object-cover rounded"
                />

                <div>

                  <h2 className="text-lg font-semibold">
                    {book.title}
                  </h2>

                  <p className="text-sm text-zinc-400 mt-1">
                    {subgenres.map(s => s.label).join(", ")}
                  </p>

                </div>

              </div>

            </Link>
          )
        })}

      </div>

    </section>
  )
}