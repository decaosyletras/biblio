{/*export type Review = {
  slug: string
  title: string
  author: string
  cover: string
  excerpt: string
  rating: number
  genre: string
}*/}

export type BookCoverSource =
  | "amazon"
  | "author_upload"
  | "admin_upload"
  | "legacy"
  | "generic"

export type Book = {
  // Los respaldos estáticos históricos no tienen UUID. Todo libro servido por
  // getBooks() sí lo tiene mediante DatabaseBook.
  id?: string
  slug: string
  title: string
  cover: string
  coverSource?: BookCoverSource
  amazon: {
    es: string,
    mx: string,
    us: string,
  },
  amazonLink: string
  authorSlug: string[]
  authorNames?: string[]

  authors?: {
    id: string
    name: string
    slug: string
  }[]

  authorId?: string
  isSaga: boolean
  categories: number[]
  summary: string
  review: {
    title: string
    excerpt: string
    content: string
    metrics: string[]
  }

  genre: string[]
  subgenres: string[]

  tags: {
    ritmo: number
    complejidad: number
    cargaEmocional: number
    conflicto: number
    worldbuilding: number
    accesibilidad: number
    profundidad: number
  }
}

export type DatabaseBook = Book & {
  id: string
}

export type Author = {
  slug: string
  name: string
  avatar: string
  bio: string
  description: string
  style: string
  similar: string[]
}

export type Category = {
  id: number
  name: string
}
