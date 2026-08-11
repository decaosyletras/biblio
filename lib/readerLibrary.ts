import "server-only"
import { getBooks } from "@/lib/books"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { DatabaseBook } from "@/types"

export type PublicReaderBook = {
  book: DatabaseBook
  isRead: boolean
  isFavorite: boolean
  favoritedAt: string | null
  addedAt: string
  readAt: string | null
}

export async function getPublicReaderLibrary(
  username: string,
  includeFavorites = false,
  ownerUserId?: string
): Promise<PublicReaderBook[]> {
  // user_id se resuelve exclusivamente en servidor. La página pública recibe
  // libros y estados, nunca el identificador interno de la cuenta.
  let readerUserId = ownerUserId

  if (!readerUserId) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("reader_profiles")
      .select("user_id")
      .eq("username", username)
      .eq("is_public", true)
      .maybeSingle()

    if (profileError || !profile?.user_id) return []
    readerUserId = profile.user_id
  }

  if (!readerUserId) return []

  const { data: memberships, error: membershipsError } = await supabaseAdmin
    .from("reader_books")
    .select("book_id, is_read, is_favorite, favorited_at, added_at, read_at")
    .eq("user_id", readerUserId)

  if (membershipsError || !memberships?.length) return []

  const books = await getBooks()
  const booksById = new Map(books.map((book) => [book.id, book]))

  return memberships
    .map((membership) => {
      const book = booksById.get(membership.book_id)

      if (!book) return null

      return {
        book,
        isRead: membership.is_read,
        isFavorite: includeFavorites && membership.is_favorite,
        favoritedAt:
          includeFavorites && membership.is_favorite
            ? membership.favorited_at
            : null,
        addedAt: membership.added_at,
        readAt: membership.read_at,
      }
    })
    .filter((item): item is PublicReaderBook => item !== null)
    .sort((a, b) =>
      a.book.title.localeCompare(b.book.title, "es", {
        sensitivity: "base",
      })
    )
}
