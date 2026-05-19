import { authors } from "@/data/authors"
import { books } from "@/data/books"
import { Book } from "@/types"

function getScore(a: Book, b: Book) {
  let score = 0

  if (a.genre === b.genre) score += 5

  const sharedSub = a.subgenres.filter(s => b.subgenres.includes(s))
  score += sharedSub.length * 3

  Object.keys(a.tags).forEach((key) => {
    const diff = Math.abs(
      a.tags[key as keyof typeof a.tags] -
      b.tags[key as keyof typeof b.tags]
    )

    score += (2 - diff)
  })

  return score
}

// ⚠️ evitamos hydration mismatch
function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort((a, b) =>
    String((a as any).slug).localeCompare(String((b as any).slug))
  )
  return shuffled.slice(0, n)
}

export function getRecommendedAuthors(currentAuthorSlug: string) {

  // 🔥 libros del autor actual (MULTI-AUTOR)
  const currentBooks = books.filter(
    b => b.authorSlug?.includes(currentAuthorSlug)
  )

  // 🔥 calcular scores SOLO de otros autores
  const scoredAuthors = authors
    .filter(a => a.slug !== currentAuthorSlug)
    .map(author => {

      const authorBooks = books.filter(
        b => b.authorSlug?.includes(author.slug)
      )

      let totalScore = 0

      currentBooks.forEach(cb => {
        authorBooks.forEach(ab => {
          totalScore += getScore(cb, ab)
        })
      })

      return {
        ...author,
        score: totalScore
      }
    })

  // 🔥 ordenar
  const top4 = scoredAuthors
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  // 🔥 random estable (sin hydration issues)
  return getRandomItems(top4, 2)
}