import Link from "next/link"
import { redirect } from "next/navigation"
import ReaderLibraryManager from "@/components/readers/ReaderLibraryManager"
import { getBooks } from "@/lib/books"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export default async function MyLibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const books = await getBooks()
  const alphabeticalBooks = [...books].sort((a, b) =>
    a.title.localeCompare(b.title, "es", {
      sensitivity: "base",
    })
  )

  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/*<p className="text-sm font-medium uppercase tracking-[0.2em] text-yellow-400">
              Mi espacio lector
            </p>*/}
            <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
              Mi biblioteca
            </h1>
            <p className="mt-3 max-w-xl text-zinc-400">
              Organiza tus intereses y distingue las historias que ya leíste de las que aún tienes pendientes.
            </p>
          </div>

          <Link
            href="/book-directory"
            className="shrink-0 rounded-xl bg-yellow-500 px-5 py-3 text-center font-semibold text-black transition hover:bg-yellow-400"
          >
            Agregar más libros
          </Link>
        </header>

        <ReaderLibraryManager books={alphabeticalBooks} />
      </div>
    </main>
  )
}
