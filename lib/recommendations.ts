import { Book } from "@/types"

export function getRecommendedBooks(
  currentBook: Book,
  allBooks: Book[]
): Book[] {

  return allBooks
    .filter(b => b.slug !== currentBook.slug)
    .map(book => {
      const sharedCategories = book.categories.filter(cat =>
        currentBook.categories.includes(cat)
      ).length

      return {
        ...book,
        score: sharedCategories
      }
    })
    .filter(book => book.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}