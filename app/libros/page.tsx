import { books } from "@/data/books"
import { categories } from "@/data/categories"
import BookRow from "@/components/BookRow"
import SearchBooks from "@/components/SearchBooks"

export default function Page() {
  return (
    <div className="relative">
    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

    {/* contenido */

      <section className="py-10">

        <h1 className="text-3xl font-semibold text-zinc-100 px-6 mb-8">
          Explorar libros
        </h1>

        <SearchBooks />

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
            />
          )
        })}

      </section>
    }
  </div>
  )
}