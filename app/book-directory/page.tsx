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
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-yellow-400">
            Biblioteca indie
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Directorio de libros
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
            Explora todos los libros en orden alfabético y construye una biblioteca personal con tus intereses y lecturas.
          </p>
        </header>

        <BookDirectory books={alphabeticalBooks} />
      </div>
    </main>
  )
}
