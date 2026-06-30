import { getBooks } from "@/lib/books"
import { Book } from "@/types"
export const dynamic = "force-dynamic"

// 🔧 helper
function normalizeArray(val: any): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

// 🧠 SCORE
function getScore(a: Book, b: Book) {
  let score = 0

  // 🟣 1. GÉNEROS
  const genresA = normalizeArray(a.genre)
  const genresB = normalizeArray(b.genre)

  const sharedGenres = genresA.filter(g => genresB.includes(g))
  score += sharedGenres.length * 5

  // 🔵 2. SUBGÉNEROS
  sharedGenres.forEach((genre) => {
    const subA = (a.subgenres as any)?.[genre] || []
    const subB = (b.subgenres as any)?.[genre] || []

    const sharedSub = subA.filter((s: string) => subB.includes(s))
    score += sharedSub.length * 5
  })

  // 🧠 3. MÉTRICAS
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
    score += (2 - diff)
  })

  return score
}

// 🎲 SHUFFLE REAL (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

// 🚀 MAIN
export async function getRecommendedBooks(currentSlug: string) {
  const books = await getBooks()
  const current = books.find(b => b.slug === currentSlug)
  if (!current) return []

  const currentAuthors = normalizeArray(current.authorSlug)

  const ranked = books
    .filter(b => {
      const bookAuthors = normalizeArray(b.authorSlug)

      // ❌ excluir mismo libro
      if (b.slug === currentSlug) return false

      // ❌ excluir mismos autores
      if (bookAuthors.some(a => currentAuthors.includes(a))) return false

      return true
    })
    .map(b => ({
      ...b,
      score: getScore(current, b),
    }))
    .sort((a, b) => b.score - a.score)

  // 🔥 TOP 5 por relevancia
  const top5 = ranked.slice(0, 7)

  // 🎲 shuffle SOLO de esos 5
  const shuffledTop5 = shuffleArray(top5)

  // 🎯 devolver 3 finales
  return shuffledTop5.slice(0, 4)
}