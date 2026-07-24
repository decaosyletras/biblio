import { createClient } from "@/lib/supabase-server"

export async function getLatestAuthorNews() {

  const supabase = await createClient()

  const since = new Date()

  since.setDate(
    since.getDate() - 15
  )

  const { data, error } = await supabase
    .from("authors")
    .select(`
      id,
      name,
      slug,
      avatar,
      pro,
      theme,
      news,
      news_updated_at
  `)
    .eq("pro", true)
    .gte(
      "news_updated_at",
      since.toISOString()
    )
    .order(
      "news_updated_at",
      {
        ascending: false
      }
    )

  console.log("NEWS HOME", data, error)

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
      ?.map((x: any) => x.author)
      .filter(Boolean) ?? []

  for (const author of authors) {

    // Libros donde es autor principal
    const { data: mainBooks } = await supabase
      .from("books")
      .select("id")
      .eq("author_id", author.id)
      .eq("approved", true)


    // Libros donde aparece en la relación múltiple
    const { data: extraBooks } = await supabase
      .from("book_authors")
      .select(`
        book_id,
        books!inner(
          approved
        )
      `)
      .eq("author_id", author.id)
      .eq("books.approved", true)


    const bookIds = new Set([
      ...(mainBooks?.map(b => b.id) ?? []),
      ...(extraBooks?.map(b => b.book_id) ?? [])
    ])


    author.booksCount = bookIds.size
  }

  return authors.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}