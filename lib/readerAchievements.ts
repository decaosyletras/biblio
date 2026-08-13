import "server-only"

import { getBooks } from "@/lib/books"
import {
  READER_ACHIEVEMENTS,
  READER_ACHIEVEMENT_KEYS,
  type ReaderAchievementKey,
  type ReaderAchievementStatus,
} from "@/lib/readerAchievementCatalog"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { DatabaseBook } from "@/types"

type StoredAchievement = {
  achievement_key: string
  first_unlocked_at: string
  celebrated_at: string | null
}

type ReaderMembership = {
  book_id: string
  is_read: boolean
  is_favorite: boolean
  read_year: number | null
}

function normalizedValues(values: string[] | undefined) {
  return (values ?? [])
    .map((value) => value.trim().toLocaleLowerCase("es"))
    .filter(Boolean)
}

function getDistinctAuthorKey(book: DatabaseBook) {
  if (book.authors?.length) {
    return book.authors.map((author) => author.id || author.slug)
  }

  return (book.authorNames ?? []).map((name) =>
    name.trim().toLocaleLowerCase("es")
  )
}

function calculateProgress(
  memberships: ReaderMembership[],
  booksById: Map<string, DatabaseBook>,
  hasProfile: boolean
) {
  const visibleMemberships = memberships.filter((membership) =>
    booksById.has(membership.book_id)
  )
  const readMemberships = visibleMemberships.filter(
    (membership) => membership.is_read
  )
  const favoriteMemberships = readMemberships.filter(
    (membership) => membership.is_favorite
  )
  const readBooks = readMemberships
    .map((membership) => booksById.get(membership.book_id))
    .filter((book): book is DatabaseBook => Boolean(book))
  const favoriteBooks = favoriteMemberships
    .map((membership) => booksById.get(membership.book_id))
    .filter((book): book is DatabaseBook => Boolean(book))
  const genres = new Set(readBooks.flatMap((book) => normalizedValues(book.genre)))
  const subgenres = new Set(
    readBooks.flatMap((book) => normalizedValues(book.subgenres))
  )
  const favoriteGenres = new Set(
    favoriteBooks.flatMap((book) => normalizedValues(book.genre))
  )
  const authors = new Set<string>()
  const readsByAuthor = new Map<string, number>()

  readBooks.forEach((book) => {
    const bookAuthors = new Set(getDistinctAuthorKey(book).filter(Boolean))

    bookAuthors.forEach((authorKey) => {
      authors.add(authorKey)
      readsByAuthor.set(authorKey, (readsByAuthor.get(authorKey) ?? 0) + 1)
    })
  })

  return new Map<ReaderAchievementKey, number>([
    ["profile-identity", hasProfile ? 1 : 0],
    ["first-shelf", visibleMemberships.length > 0 ? 1 : 0],
    ["first-read", readMemberships.length > 0 ? 1 : 0],
    ["recommendation-image", 0],
    ["library-image", 0],
    ["first-favorite", favoriteMemberships.length],
    ["library-5", visibleMemberships.length],
    ["library-25", visibleMemberships.length],
    ["read-5", readMemberships.length],
    ["read-25", readMemberships.length],
    ["genres-3", genres.size],
    ["genres-5", genres.size],
    ["subgenres-5", subgenres.size],
    ["authors-5", authors.size],
    ["same-author-3", Math.max(0, ...readsByAuthor.values())],
    ["sagas-3", readBooks.filter((book) => book.isSaga).length],
    [
      "lectometer-3",
      readBooks.filter((book) => Boolean(book.review?.title)).length,
    ],
    [
      "dated-reads-5",
      readMemberships.filter((membership) => membership.read_year !== null)
        .length,
    ],
    ["favorites-10", favoriteMemberships.length],
    ["favorite-genres-3", favoriteGenres.size],
  ])
}

export async function unlockReaderAchievement(
  userId: string,
  key: ReaderAchievementKey,
  periodKey = "lifetime"
) {
  if (!READER_ACHIEVEMENT_KEYS.has(key)) return false

  try {
    const { error } = await supabaseAdmin
      .from("reader_achievements")
      .upsert(
        {
          user_id: userId,
          achievement_key: key,
          period_key: periodKey,
        },
        {
          onConflict: "user_id,achievement_key,period_key",
          ignoreDuplicates: true,
        }
      )

    return !error
  } catch {
    // Una medalla nunca debe impedir la acción principal del lector.
    return false
  }
}

export async function getReaderAchievementSnapshot(
  userId: string,
  options: { sync: boolean }
): Promise<{
  achievements: ReaderAchievementStatus[]
  newlyUnlockedKeys: ReaderAchievementKey[]
}> {
  const [profileResult, membershipsResult, storedResult, books] =
    await Promise.all([
      supabaseAdmin
        .from("reader_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("reader_books")
        .select("book_id, is_read, is_favorite, read_year")
        .eq("user_id", userId),
      supabaseAdmin
        .from("reader_achievements")
        .select("achievement_key, first_unlocked_at, celebrated_at")
        .eq("user_id", userId)
        .eq("period_key", "lifetime"),
      getBooks(),
    ])

  if (profileResult.error || membershipsResult.error || storedResult.error) {
    throw new Error("No se pudieron calcular los logros")
  }

  const memberships = (membershipsResult.data ?? []) as ReaderMembership[]
  const stored = (storedResult.data ?? []) as StoredAchievement[]
  const storedByKey = new Map(
    stored.map((achievement) => [
      achievement.achievement_key,
      achievement.first_unlocked_at,
    ])
  )
  const uncelebratedKeys = new Set(
    stored
      .filter((achievement) => achievement.celebrated_at === null)
      .map((achievement) => achievement.achievement_key)
  )
  const booksById = new Map(books.map((book) => [book.id, book]))
  const progress = calculateProgress(
    memberships,
    booksById,
    Boolean(profileResult.data)
  )
  const currentlyAchieved = READER_ACHIEVEMENTS.filter((achievement) => {
    const current = progress.get(achievement.key) ?? 0

    return achievement.mode === "permanent"
      ? storedByKey.has(achievement.key) || current >= achievement.target
      : current >= achievement.target
  })
  const keysToStore = currentlyAchieved
    .filter((achievement) => !storedByKey.has(achievement.key))
    .map((achievement) => achievement.key)

  if (options.sync && keysToStore.length > 0) {
    const unlockedAt = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from("reader_achievements")
      .upsert(
        keysToStore.map((key) => ({
          user_id: userId,
          achievement_key: key,
          period_key: "lifetime",
          first_unlocked_at: unlockedAt,
        })),
        {
          onConflict: "user_id,achievement_key,period_key",
          ignoreDuplicates: true,
        }
      )

    if (error) throw new Error("No se pudieron sincronizar los logros")

    keysToStore.forEach((key) => {
      storedByKey.set(key, unlockedAt)
      uncelebratedKeys.add(key)
    })
  }

  const activeKeys = new Set(
    currentlyAchieved.map((achievement) => achievement.key)
  )
  const newlyUnlockedKeys = options.sync
    ? READER_ACHIEVEMENTS.map((achievement) => achievement.key).filter(
        (key) => uncelebratedKeys.has(key) && activeKeys.has(key)
      )
    : []

  if (newlyUnlockedKeys.length > 0) {
    const { error } = await supabaseAdmin
      .from("reader_achievements")
      .update({ celebrated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("period_key", "lifetime")
      .in("achievement_key", newlyUnlockedKeys)

    if (error) throw new Error("No se pudo registrar la celebración")
  }

  return {
    achievements: READER_ACHIEVEMENTS.map((achievement) => {
      const current = progress.get(achievement.key) ?? 0
      const hasPermanentUnlock =
        achievement.mode === "permanent" && storedByKey.has(achievement.key)

      return {
        ...achievement,
        current,
        isActive: hasPermanentUnlock || current >= achievement.target,
        firstUnlockedAt: storedByKey.get(achievement.key) ?? null,
      }
    }),
    newlyUnlockedKeys,
  }
}

export async function getPublicReaderAchievements(
  username: string,
  ownerUserId?: string
) {
  let readerUserId = ownerUserId

  if (!readerUserId) {
    const { data: profile, error } = await supabaseAdmin
      .from("reader_profiles")
      .select("user_id, show_achievements")
      .eq("username", username)
      .eq("is_public", true)
      .maybeSingle()

    if (error || !profile?.user_id || !profile.show_achievements) return []
    readerUserId = profile.user_id
  }

  if (!readerUserId) return []

  const { achievements } = await getReaderAchievementSnapshot(readerUserId, {
    sync: false,
  })

  return achievements
    .filter((achievement) => achievement.isActive)
    .sort((a, b) => {
      if (!a.firstUnlockedAt && !b.firstUnlockedAt) return 0
      if (!a.firstUnlockedAt) return 1
      if (!b.firstUnlockedAt) return -1
      return b.firstUnlockedAt.localeCompare(a.firstUnlockedAt)
    })
}
