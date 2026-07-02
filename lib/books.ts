import { Book } from "@/types"
import { books as staticBooks } from "@/data/books"
import { supabase } from "@/lib/supabase"
import { unstable_noStore as noStore } from "next/cache"

export const revalidate = 0

export async function getBooks(): Promise<Book[]> {
  noStore()

  // 1. Libros
  const { data: booksData, error: booksError } = await supabase
    .from("books")
    .select("*")
    .eq("approved", true)

  if (booksError) {
    console.error("booksError:", booksError)
    return staticBooks
  }

  // 2. Autores
  const { data: authorsData, error: authorsError } = await supabase
    .from("authors")
    .select("id, slug, name")

  if (authorsError) {
    console.error("authorsError:", authorsError)
    return staticBooks
  }

  // 3. Relación book_authors
  const { data: bookAuthorsData, error: bookAuthorsError } = await supabase
    .from("book_authors")
    .select("book_id, author_id")

  if (bookAuthorsError) {
    console.error("bookAuthorsError:", bookAuthorsError)
  }

  // Map autores por id
  const authorsMap = new Map(
    (authorsData || []).map(a => [a.id, a])
  )

  // Map libro (DB id) por slug → NECESARIO para mezclar con staticBooks
  const booksMapBySlug = new Map(
    (booksData || []).map(b => [b.slug, b.id])
  )

  // Agrupar autores por book_id
  const authorsByBook = new Map<string, { slug: string; name: string }[]>()

  for (const rel of bookAuthorsData || []) {
    const author = authorsMap.get(rel.author_id)
    if (!author) continue

    const list = authorsByBook.get(rel.book_id) || []

    authorsByBook.set(rel.book_id, [
      ...list,
      {
        slug: author.slug,
        name: author.name,
      },
    ])
  }

  // 4. Construcción final
  const dynamicBooks: Book[] = (booksData || []).map((book: any) => {

    const singleAuthor = book.author_id
      ? authorsMap.get(book.author_id)
      : null

    // 🔥 FIX CLAVE: resolver book_id real desde slug
    const realBookId = booksMapBySlug.get(book.slug)

    const multiAuthors = realBookId
      ? authorsByBook.get(realBookId)
      : undefined

    const hasMulti = multiAuthors && multiAuthors.length > 0

    return {
      slug: book.slug,
      title: book.title?.toUpperCase() || "",
      cover: book.cover || "",

      amazon: {
        es: book.asin_es || "",
        mx: book.asin_mx || "",
        us: book.asin_us || "",
      },

      amazonLink: book.amazon_link || "",

      // 👇 prioridad correcta
      authorSlug: hasMulti
        ? multiAuthors!.map(a => a.slug)
        : singleAuthor
          ? [singleAuthor.slug]
          : [],

      authorNames: hasMulti
        ? multiAuthors!.map(a => a.name)
        : singleAuthor
          ? [singleAuthor.name]
          : [],

      isSaga: book.is_saga ?? false,
      categories: book.categories || [],
      summary: book.summary || "",

      review: {
        title: book.review_title || "",
        excerpt: book.review_excerpt || "",
        content: book.review_content || "",
        metrics: book.review_metrics || [],
      },

      genre: book.genres || [],
      subgenres: book.subgenres || [],

      tags: book.tags || {
        ritmo: 0,
        complejidad: 0,
        cargaEmocional: 0,
        conflicto: 0,
        worldbuilding: 0,
        accesibilidad: 0,
        profundidad: 0,
      },
    }
  })

  return [...staticBooks, ...dynamicBooks]
}