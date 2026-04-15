{/*export type Review = {
  slug: string
  title: string
  author: string
  cover: string
  excerpt: string
  rating: number
  genre: string
}*/}

export type Book = {
  slug: string
  title: string
  cover: string
  amazonLink: string
  authorSlug: string
  categories: number[]
  review: {
    title: string
    excerpt: string
    content: string

    metrics: {
      originalidad: number
      prosa: number
      complejidad: number
      personajes: number
      consistencia: number
      adictivo: number
    }
  }
  
  genres: {
    romance: number
    cienciaFiccion: number
    fantasia: number
    misterio: number
  }
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