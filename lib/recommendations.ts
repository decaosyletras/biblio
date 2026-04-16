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

// 🔥 helper random
function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

export function getRecommendedBooks(
  currentBook: Book,
  allBooks: Book[]
): Book[] {

  const topMatches = allBooks
    .filter(b => b.slug !== currentBook.slug)
    .map(book => {
      const distance = getDistance(
        currentBook.genres,
        book.genres
      )

      return {
        ...book,
        score: distance
      }
    })
    .sort((a, b) => a.score - b.score) // más similar primero
    .slice(0, 5) // 🔥 top 5

  // 🔥 ahora aleatorio de esos 5
  return getRandomItems(topMatches, 3)
}