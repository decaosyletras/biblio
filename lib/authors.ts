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

  const { count } = await supabase
      .from("book_authors")
      .select(`
        book_id,
        books!inner(
          approved
        )
      `, {
        count: "exact",
        head: true
      })
      .eq("author_id", author.id)
      .eq("books.approved", true)

    author.booksCount = count ?? 0
  }

  return authors.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}