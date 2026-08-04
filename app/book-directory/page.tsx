import BookDirectory from "@/components/readers/BookDirectory"
import { getBooks } from "@/lib/books"

export const dynamic = "force-dynamic"

export default async function BookDirectoryPage() {
  const books = await getBooks()
  const alphabeticalBooks = [...books].sort((a, b) =>
    a.title.localeCompare(b.title, "es", {
      sensitivity: "base",
    })
  )

  return (
    <main className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 sm:mb-10">
          {/* La cabecera doble anterior se conserva comentada porque repetía dos
              conceptos para la misma colección y se alejaba del formato general. */}
          {/* <p className="text-sm font-medium uppercase tracking-[0.2em] text-yellow-400">
            Biblioteca indie
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Directorio de libros
          </h1> */}
          <h1 className="mb-6 text-2xl font-semibold text-zinc-100 sm:mb-10 sm:text-3xl">
            Biblioteca indie
          </h1>
          <p className="max-w-2xl leading-relaxed text-zinc-400">
            Explora la biblioteca general de Casa Indie y agrega a tu biblioteca personal los libros que te interesan o que ya leíste.
          </p>
        </header>

        <BookDirectory books={alphabeticalBooks} />
      </div>
    </main>
  )
}
