import { Book } from "@/types"

function getDistance(a: Record<string, number>, b: Record<string, number>) {
  const keys = Object.keys(a)

  let sum = 0

  for (const key of keys) {
    const diff = a[key] - b[key]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

export function getRecommendedBooks(
  currentBook: Book,
  allBooks: Book[]
): Book[] {

  return allBooks
    .filter(b => b.slug !== currentBook.slug)
    .map(book => {
      const distance = getDistance(
        currentBook.genres, // 🔥 ahora usa géneros
        book.genres
      )

      return {
        ...book,
        score: distance
      }
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
}