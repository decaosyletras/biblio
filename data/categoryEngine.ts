import { categoryRules } from "./categoryRules"

export function getCategoriesForBook(book: {
  genre: string[]
  subgenres: string[]
}) {
  return categoryRules.filter(rule =>
    rule.match(book)
  )
}