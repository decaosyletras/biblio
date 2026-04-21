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

function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

export function getRecommendedAuthors(currentAuthorSlug: string) {

  // 🔥 libros del autor actual
  const currentBooks = books.filter(
    b => b.authorSlug === currentAuthorSlug
  )

  // 🔥 calcular scores SOLO de otros autores
  const scoredAuthors = authors
    .filter(a => a.slug !== currentAuthorSlug) // ✅ FIX CLAVE
    .map(author => {

      const authorBooks = books.filter(
        b => b.authorSlug === author.slug
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

  // 🔥 random 2
  return getRandomItems(top4, 2)
}