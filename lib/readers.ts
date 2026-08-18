import "server-only"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getOwnedBookIdsByUser } from "@/lib/readerOwnedBooks"

export type PublicReaderSummary = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  bookCount: number
  readCount: number
}

type PublicReaderRow = {
  user_id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
}

type ReaderBookCountRow = {
  user_id: string
  book_id: string
  is_read: boolean
}

export async function getPublicReaders(): Promise<PublicReaderSummary[]> {
  const { data, error } = await supabaseAdmin
    .from("reader_profiles")
    .select("user_id, username, display_name, bio, avatar_url")
    .eq("is_public", true)

  if (error || !data?.length) return []

  const profiles = data as PublicReaderRow[]
  const publicUserIds = profiles.map((profile) => profile.user_id)
  const [{ data: libraryRows }, ownedBookIdsByUser] = await Promise.all([
    supabaseAdmin
      .from("reader_books")
      .select("user_id, book_id, is_read")
      .in("user_id", publicUserIds),
    getOwnedBookIdsByUser(publicUserIds).catch(() => null),
  ])

  if (!ownedBookIdsByUser) return []

  const countsByUser = new Map<string, { books: number; read: number }>()

  for (const row of (libraryRows ?? []) as ReaderBookCountRow[]) {
    if (ownedBookIdsByUser.get(row.user_id)?.has(row.book_id)) continue

    const counts = countsByUser.get(row.user_id) ?? { books: 0, read: 0 }
    counts.books += 1
    counts.read += row.is_read ? 1 : 0
    countsByUser.set(row.user_id, counts)
  }

  // user_id sólo se usa para unir y contar dentro del servidor. El DTO público
  // devuelve exclusivamente la información necesaria para dibujar el directorio.
  return profiles
    .map((profile) => {
      const counts = countsByUser.get(profile.user_id) ?? { books: 0, read: 0 }

      return {
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        bookCount: counts.books,
        readCount: counts.read,
      }
    })
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "es", {
        sensitivity: "base",
      })
    )
}
