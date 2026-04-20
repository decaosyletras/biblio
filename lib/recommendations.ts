import { Book } from "@/types"

function getScore(a: Book, b: Book) {
  let score = 0

  // 🔥 mismo género
  if (a.genre === b.genre) score += 5

  // 🔥 subgéneros en común
  const sharedSub = a.subgenres.filter(s => b.subgenres.includes(s))
  score += sharedSub.length * 3

  // 🔥 etiquetas (distancia)
  Object.keys(a.tags).forEach((key) => {
    const diff = Math.abs(a.tags[key as keyof typeof a.tags] - b.tags[key as keyof typeof b.tags])
    score += (2 - diff) // mientras más parecido, más suma
  })

  return score
}

function getRandomItems<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n)
}

export function getRecommendedBooks(current: Book, books: Book[]) {
  const ranked = books
    .filter(b => b.slug !== current.slug)
    .map(b => ({
      ...b,
      score: getScore(current, b),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return getRandomItems(ranked, 3)
}