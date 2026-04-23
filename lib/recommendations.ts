import { books } from "@/data/books"
import { Book } from "@/types"

// 🔧 helper
function normalizeArray(val: any): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

// 🧠 SCORE
function getScore(a: Book, b: Book) {
  let score = 0

  // 🟣 1. GÉNEROS (MULTI)
  const genresA = normalizeArray(a.genre)
  const genresB = normalizeArray(b.genre)

  const sharedGenres = genresA.filter(g => genresB.includes(g))

  // peso fuerte
  score += sharedGenres.length * 8

  // bonus si comparten al menos uno
  if (sharedGenres.length > 0) {
    score += 5
  }

  // 🔵 2. SUBGÉNEROS POR GÉNERO
  sharedGenres.forEach((genre) => {
    const subA = (a.subgenres as any)?.[genre] || [];
    const subB = (b.subgenres as any)?.[genre] || [];

    const sharedSub = subA.filter((s: string) => subB.includes(s))

    score += sharedSub.length * 5
  })

  // 🧠 3. MÉTRICAS (strings)
  const metricsA = a.review.metrics || []
  const metricsB = b.review.metrics || []

  const sharedMetrics = metricsA.filter((m: string) =>
    metricsB.includes(m)
  )

  score += sharedMetrics.length * 3

  // 🟡 4. TAGS
  Object.keys(a.tags || {}).forEach((key) => {
    const valA = a.tags[key as keyof typeof a.tags]
    const valB = b.tags[key as keyof typeof b.tags]

    if (valA === undefined || valB === undefined) return

    const diff = Math.abs(valA - valB)

    score += (2 - diff) // 0–2
  })

  return score
}

// 🎲 random controlado
function getRandomItems<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n)
}

// 🚀 MAIN
export function getRecommendedBooks(currentSlug: string) {
  const current = books.find(b => b.slug === currentSlug)
  if (!current) return []

  const ranked = books
    .filter(b => b.slug !== currentSlug)
    .map(b => ({
      ...b,
      score: getScore(current, b),
    }))
    .sort((a, b) => b.score - a.score)

  // 🔥 top real
  const top = ranked.slice(0, 6)

  return getRandomItems(top, 3)
}