import { thematicCollections } from "./thematicCollections"

export function getBooksForTheme(
  books: any[],
  metricId: string
) {
  return books.filter((book) =>
    book.metrics?.includes(metricId)
  )
}

export { thematicCollections }