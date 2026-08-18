import "server-only"

import { supabaseAdmin } from "@/lib/supabaseAdmin"

export type OwnedAuthorSummary = {
  id: string
  name: string
  slug: string
}

export type ReaderOwnedBookContext = {
  authors: OwnedAuthorSummary[]
  bookIds: Set<string>
}

type ClaimRow = {
  user_id: string
  author_id: string
}

async function getBookIdsByAuthor(authorIds: string[]) {
  const result = new Map<string, Set<string>>()

  if (authorIds.length === 0) return result

  const [mainBooksResult, relatedBooksResult] = await Promise.all([
    supabaseAdmin
      .from("books")
      .select("id, author_id")
      .in("author_id", authorIds),
    supabaseAdmin
      .from("book_authors")
      .select("book_id, author_id")
      .in("author_id", authorIds),
  ])

  if (mainBooksResult.error || relatedBooksResult.error) {
    throw new Error("No se pudieron consultar los libros del autor")
  }

  for (const row of mainBooksResult.data ?? []) {
    if (!row.author_id) continue
    const bookIds = result.get(row.author_id) ?? new Set<string>()
    bookIds.add(row.id)
    result.set(row.author_id, bookIds)
  }

  for (const row of relatedBooksResult.data ?? []) {
    const bookIds = result.get(row.author_id) ?? new Set<string>()
    bookIds.add(row.book_id)
    result.set(row.author_id, bookIds)
  }

  return result
}

export async function getOwnedBookIdsByUser(
  userIds: string[]
): Promise<Map<string, Set<string>>> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))]
  const result = new Map(
    uniqueUserIds.map((userId) => [userId, new Set<string>()])
  )

  if (uniqueUserIds.length === 0) return result

  const { data: claims, error: claimsError } = await supabaseAdmin
    .from("author_claims")
    .select("user_id, author_id")
    .in("user_id", uniqueUserIds)
    .eq("status", "approved")

  if (claimsError) throw new Error("No se pudo consultar la autoría vinculada")

  const claimRows = (claims ?? []) as ClaimRow[]
  const authorIds = [...new Set(claimRows.map((claim) => claim.author_id))]

  if (authorIds.length === 0) return result

  const bookIdsByAuthor = await getBookIdsByAuthor(authorIds)

  for (const claim of claimRows) {
    const ownedBookIds = result.get(claim.user_id)
    const authorBookIds = bookIdsByAuthor.get(claim.author_id)

    if (!ownedBookIds || !authorBookIds) continue
    authorBookIds.forEach((bookId) => ownedBookIds.add(bookId))
  }

  return result
}

export async function getReaderOwnedBookContext(
  userId: string
): Promise<ReaderOwnedBookContext> {
  const { data: claims, error: claimsError } = await supabaseAdmin
    .from("author_claims")
    .select("author_id, authors(id, name, slug)")
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", { ascending: true })

  if (claimsError) throw new Error("No se pudo consultar el perfil de autor")

  const authors: OwnedAuthorSummary[] = []
  const authorIds: string[] = []

  for (const claim of claims ?? []) {
    authorIds.push(claim.author_id)
    const relation = claim.authors
    const author = Array.isArray(relation) ? relation[0] : relation

    if (author?.id && author.name && author.slug) {
      authors.push({ id: author.id, name: author.name, slug: author.slug })
    }
  }

  const bookIdsByAuthor = await getBookIdsByAuthor([...new Set(authorIds)])
  const bookIds = new Set<string>()
  bookIdsByAuthor.forEach((authorBookIds) => {
    authorBookIds.forEach((bookId) => bookIds.add(bookId))
  })

  return {
    authors,
    bookIds,
  }
}

export async function readerOwnsBook(userId: string, bookId: string) {
  const ownedByUser = await getOwnedBookIdsByUser([userId])
  return ownedByUser.get(userId)?.has(bookId) === true
}
