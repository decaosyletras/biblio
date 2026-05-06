import Link from "next/link"
import { books } from "@/data/books"
import { categories } from "@/data/categories"
import BookRow from "@/components/BookRow"
import SearchSimple from "@/components/SearchSimple"
import { genresCatalog } from "@/data/genres"
import { tagsCatalog } from "@/data/tags"

export default function Page() {
  return (
    <div className="relative">

    {/* contenido */

      <section className="py-10">

        <h1 className="text-3xl font-semibold text-zinc-100 px-6 mb-8">
          Explorar libros
        </h1>

        <p className="text-sm text-zinc-400 px-6 mb-6 max-w-2xl md:max-w-none">
          Estos enlaces son de afiliado: si compras a través de ellos, puedo recibir una comisión sin costo extra para ti y me ayudas a sostener este proyecto. {" "}
          <Link
            href="/afiliados"
            className="text-yellow-400 hover:underline"
          >
            Más información
          </Link>
        </p>

        <div className="px-6 mt-4">
          <SearchSimple data={books} type="books" />
        </div>

        {categories.map(category => {
          const filteredBooks = books.filter(book =>
            book.categories.includes(category.id)
          )

          if (filteredBooks.length === 0) return null

          return (
            <BookRow
              key={category.id}
              title={category.name}
              books={filteredBooks}
              noShuffle={category.id === 9}
            />
          )
        })}

      </section>
    }
  </div>
  )
}