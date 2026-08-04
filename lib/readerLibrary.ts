import "server-only"
import { getBooks } from "@/lib/books"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { DatabaseBook } from "@/types"

export type PublicReaderBook = {
  book: DatabaseBook
  isRead: boolean
  addedAt: string
  readAt: string | null
}

export async function getPublicReaderLibrary(
  username: string
): Promise<PublicReaderBook[]> {
  // user_id se resuelve exclusivamente en servidor. La página pública recibe
  // libros y estados, nunca el identificador interno de la cuenta.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("reader_profiles")
    .select("user_id")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle()

  if (profileError || !profile?.user_id) return []

  const { data: memberships, error: membershipsError } = await supabaseAdmin
    .from("reader_books")
    .select("book_id, is_read, added_at, read_at")
    .eq("user_id", profile.user_id)

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
