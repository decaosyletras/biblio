export type Review = {
  slug: string
  title: string
  author: string
  cover: string
  excerpt: string
  rating: number
  genre: string
}

export type Book = {
  title: string
  cover: string
  amazonLink: string
}

export type Author = {
  slug: string
  name: string
  avatar: string
  bio: string
  books: Book[]
}