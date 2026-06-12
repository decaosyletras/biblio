import { categoryRules } from "./categoryRules"

export function getCategoriesForBook(book: {
  genre: string[]
  subgenres: string[]
  review?: {
    metrics?: string[]
  }
}) {

  const normalizedBook = {
    genre: book.genre,
    subgenres: book.subgenres,
    metrics: book.review?.metrics ?? [],
  }

  return categoryRules.filter(rule =>
    rule.match(normalizedBook)
  )
}