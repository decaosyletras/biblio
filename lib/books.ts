import { DatabaseBook, type BookCoverSource } from "@/types"
// Se conserva data/books.ts como respaldo histórico, pero ya no se importa
// porque el catálogo actual debe tener una sola fuente: Supabase.
// import { books as staticBooks } from "@/data/books"
import { supabase } from "@/lib/supabase"
import { unstable_noStore as noStore } from "next/cache"

export const revalidate = 0

const BOOK_COVER_SOURCES = new Set<BookCoverSource>([
  "amazon",
  "author_upload",
  "admin_upload",
  "legacy",
  "generic",
])

function getCoverSource(book: Record<string, unknown>): BookCoverSource {
  if (
    typeof book.cover_source === "string" &&
    BOOK_COVER_SOURCES.has(book.cover_source as BookCoverSource)
  ) {
    return book.cover_source as BookCoverSource
  }

  if ([book.asin_us, book.asin_es, book.asin_mx].some(
    (asin) => typeof asin === "string" && asin.trim()
  )) return "amazon"

  return typeof book.cover === "string" && book.cover.trim()
    ? "legacy"
    : "generic"
}

export async function getBooks(): Promise<DatabaseBook[]> {
  noStore()

  // 1. Libros
  const { data: booksData, error: booksError } = await supabase
    .from("books")
    .select("*")
    .eq("approved", true).order("created_at", { ascending: true })

  if (booksError) {
    // Antes se devolvían staticBooks. Se conserva la referencia comentada
    // para documentar el respaldo anterior sin mezclar fuentes nuevamente.
    // return staticBooks
    return []
  }

  // 2. Autores
  const { data: authorsData, error: authorsError } = await supabase
    .from("authors")
    .select("id, slug, name")

  if (authorsError) {
    // Antes se devolvían staticBooks. Un error de Supabase ahora produce un
    // catálogo vacío y evita mostrar información histórica o duplicada.
    // return staticBooks
    return []
  }

  // 3. Relación book_authors
  const { data: bookAuthorsData, error: bookAuthorsError } = await supabase
    .from("book_authors")
    .select("book_id, author_id")

  if (bookAuthorsError) {
  }

  // Map autores por id
  const authorsMap = new Map(
    (authorsData || []).map(a => [a.id, a])
  )

  // Map libro (DB id) por slug → NECESARIO para mezclar con staticBooks
  // Este mapa era necesario para reconciliar libros estáticos con Supabase.
  // Se conserva comentado como referencia, pero ahora usamos book.id directo.
  // const booksMapBySlug = new Map(
  //   (booksData || []).map(b => [b.slug, b.id])
  // )

  // Agrupar autores por book_id
  const authorsByBook = new Map<
    string,
    {
      id: string
      slug: string
      name: string
    }[]
  >()

  for (const rel of bookAuthorsData || []) {
    const author = authorsMap.get(rel.author_id)
    if (!author) continue

    const list = authorsByBook.get(rel.book_id) || []

    authorsByBook.set(rel.book_id, [
      ...list,
      {
        id: author.id,
        slug: author.slug,
        name: author.name,
      }
    ])
  }

  // 4. Construcción final
  const dynamicBooks: DatabaseBook[] = (booksData || []).map((book) => {

    const singleAuthor = book.author_id
      ? authorsMap.get(book.author_id)
      : null

    // 🔥 FIX CLAVE: resolver book_id real desde slug
    // Antes el UUID se resolvía por slug para mezclar fuentes. Supabase ya es
    // la única fuente, así que el identificador real viene en la propia fila.
    const realBookId = book.id

    const multiAuthors = realBookId
      ? authorsByBook.get(realBookId)
      : undefined

    const hasMulti = multiAuthors && multiAuthors.length > 0

    return {
      id: book.id,
      slug: book.slug,
      title: book.title?.toUpperCase() || "",
      cover: book.cover || "",
      coverSource: getCoverSource(book),

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

      authors: hasMulti
        ? multiAuthors!
        : singleAuthor
          ? [
            {
              id: singleAuthor.id,
              slug: singleAuthor.slug,
              name: singleAuthor.name,
            },
          ]
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

  // Antes se concatenaban staticBooks y dynamicBooks. Se conserva comentado
  // para registrar el comportamiento anterior sin reintroducir duplicados.
  // return [...dynamicBooks, ...staticBooks]
  return dynamicBooks
}
