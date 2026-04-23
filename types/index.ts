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
    profundidadTematica: number
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