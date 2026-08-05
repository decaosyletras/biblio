import type { DatabaseBook } from "@/types"

type ReaderLibrary = Record<string, { isRead: boolean }>
type HiddenBooks = Record<string, true>

export type ReaderRecommendation = {
  book: DatabaseBook
  reason: string
}

function intersection(left: string[], right: string[]) {
  const rightValues = new Set(right.map((value) => value.toLocaleLowerCase("es")))

  return left.filter((value) =>
    rightValues.has(value.toLocaleLowerCase("es"))
  )
}

function formatReason(values: string[], kind: "genre" | "subgenre") {
  const visibleValues = [...new Set(values)].slice(0, 2)

  if (visibleValues.length === 0) return "Comparte el estilo de tus lecturas."

  const formattedValues = new Intl.ListFormat("es", {
    style: "long",
    type: "conjunction",
  }).format(visibleValues)

  return kind === "subgenre"
    ? `Coincide con subgéneros que ya elegiste: ${formattedValues}.`
    : `Coincide con géneros que ya elegiste: ${formattedValues}.`
}

function compareBooks(source: DatabaseBook, candidate: DatabaseBook) {
  const sharedGenres = intersection(source.genre ?? [], candidate.genre ?? [])
  const sharedSubgenres = intersection(
    source.subgenres ?? [],
    candidate.subgenres ?? []
  )
  const sharedMetrics = intersection(
    source.review?.metrics ?? [],
    candidate.review?.metrics ?? []
  )
  const sharedCategories = (source.categories ?? []).filter((category) =>
    (candidate.categories ?? []).includes(category)
  )

  let score =
    sharedGenres.length * 8 +
    sharedSubgenres.length * 6 +
    sharedMetrics.length * 3 +
    sharedCategories.length * 2

  for (const key of Object.keys(source.tags ?? {}) as Array<
    keyof DatabaseBook["tags"]
  >) {
    const sourceValue = source.tags?.[key]
    const candidateValue = candidate.tags?.[key]

    if (typeof sourceValue !== "number" || typeof candidateValue !== "number") {
      continue
    }

    const difference = Math.abs(sourceValue - candidateValue)
    score += Math.max(0, 2 - difference * 0.5)
  }

  return {
    score,
    reason:
      sharedSubgenres.length > 0
        ? formatReason(sharedSubgenres, "subgenre")
        : formatReason(sharedGenres, "genre"),
  }
}

export function getReaderRecommendations({
  books,
  library,
  hiddenBooks,
  limit = 4,
}: {
  books: DatabaseBook[]
  library: ReaderLibrary
  hiddenBooks: HiddenBooks
  limit?: number
}): ReaderRecommendation[] {
  const sourceBooks = books.filter((book) => Boolean(library[book.id]))

  if (sourceBooks.length === 0) return []

  return books
    .filter((book) => !library[book.id] && !hiddenBooks[book.id])
    .map((book) => {
      const matches = sourceBooks.map((sourceBook) => {
        const match = compareBooks(sourceBook, book)
        const readWeight = library[sourceBook.id]?.isRead ? 1.2 : 1

        return {
          ...match,
          score: match.score * readWeight,
        }
      })
      const bestMatch = matches.sort((a, b) => b.score - a.score)[0]

      return {
        book,
        score: bestMatch?.score ?? 0,
        reason: bestMatch?.reason ?? "Comparte el estilo de tus lecturas.",
      }
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      left.book.title.localeCompare(right.book.title, "es", {
        sensitivity: "base",
      })
    )
    .slice(0, limit)
    .map(({ book, reason }) => ({ book, reason }))
}
