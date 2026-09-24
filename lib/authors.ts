import { createClient } from "@/lib/supabase-server"

type CatalogAuthor = Record<string, unknown> & {
  id: string
  name: string
  booksCount?: number
}

function isCatalogAuthor(value: unknown): value is CatalogAuthor {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const author = value as Record<string, unknown>
  return typeof author.id === "string" && typeof author.name === "string"
}

export async function getLatestAuthorNews() {

  const supabase = await createClient()
  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date())

  // Se comenta temporalmente para que las novedades no caduquen después de 15 días.
  // Para reactivar el límite por fecha, descomentar este bloque y el filtro .gte de abajo.
  // const since = new Date()

  // since.setDate(
  //   since.getDate() - 15
  // )

  const { data } = await supabase
    .from("authors")
    .select(`
      id,
      name,
      slug,
      avatar,
      pro,
      theme,
      news,
      news_updated_at,
      news_expires_on
  `)
    .eq("pro", true)
    // Se desactiva el filtro por fecha para mostrar las novedades indefinidamente por ahora.
    // .gte(
    //   "news_updated_at",
    //   since.toISOString()
    // )
    .neq("news->>type", "")
    // Una fecha nula mantiene la novedad visible indefinidamente. Si existe,
    // se muestra hasta el día indicado y deja de aparecer al día siguiente.
    .or(`news_expires_on.is.null,news_expires_on.gte.${today}`)
    .order(
      "news_updated_at",
      {
        ascending: false
      }
    )

  return data ?? []
}

export async function getAuthors() {

  const supabase = await createClient()

  const { data: claims } = await supabase
    .from("author_claims")
    .select(`
            author:authors(*)
        `)
    .eq("status", "approved")

  const authors =
    claims
      ?.map(claim => claim.author as unknown)
      .filter(isCatalogAuthor) ?? []

  const authorIds = Array.from(
    new Set(
      authors
        .map(author => author.id)
        .filter((authorId): authorId is string => typeof authorId === "string")
    )
  )

  if (authorIds.length === 0) {
    return []
  }

  // Los libros principales y las coautorías son independientes. Consultarlos
  // por lote evita ejecutar dos peticiones adicionales por cada autor.
  const [{ data: mainBooks }, { data: extraBooks }] = await Promise.all([
    supabase
      .from("books")
      .select("id, author_id")
      .in("author_id", authorIds)
      .eq("approved", true),
    supabase
      .from("book_authors")
      .select(`
        author_id,
        book_id,
        books!inner(
          approved
        )
      `)
      .in("author_id", authorIds)
      .eq("books.approved", true),
  ])

  const bookIdsByAuthor = new Map(
    authorIds.map(authorId => [authorId, new Set<string>()])
  )

  mainBooks?.forEach(book => {
    if (!book.author_id) return
    bookIdsByAuthor.get(book.author_id)?.add(book.id)
  })

  extraBooks?.forEach(book => {
    bookIdsByAuthor.get(book.author_id)?.add(book.book_id)
  })

  authors.forEach(author => {
    author.booksCount = bookIdsByAuthor.get(author.id)?.size ?? 0
  })

  return authors.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}
