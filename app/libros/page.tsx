import { books } from "@/data/books"
import { categories } from "@/data/categories"
import BookRow from "@/components/BookRow"
import SearchSimple from "@/components/SearchSimple"

export default function Page() {
  return (
    <div className="relative">

    {/* contenido */

      <section className="py-10">

        <h1 className="text-3xl font-semibold text-zinc-100 px-6 mb-8">
          Explorar libros
        </h1>
        <SearchSimple data={books} type="books" />

        {categories.map(category => {
          const filteredBooks = books.filter(book =>
            book.categories.includes(category.id)
          )

          if (filteredBooks.length === 0) return null

          return (
            <BookRow
              keyCategory={category.id}
              title={category.name}
              books={filteredBooks}
            />
          )
        })}

      </section>
    }
  </div>
  )
}