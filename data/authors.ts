import { Author } from "@/types"

export const authors: Author[] = [
  {
    slug: "autor-x",
    name: "Autor X",
    avatar: "/authors/autor1.jpg",
    bio: "Escritor de ficción intensa.",
    description: "Autor que explora emociones humanas profundas y conflictos internos.",
    style: "Narrativa intensa, introspectiva y emocional.",
    similar: ["autor-y"]
  },
  {
    slug: "autor-y",
    name: "Autor Y",
    avatar: "/authors/autor2.jpg",
    bio: "Narrativa emocional contemporánea.",
    description: "Sus historias conectan con experiencias cotidianas y emociones reales.",
    style: "Ligero, emocional y fácil de leer.",
    similar: ["autor-x"]
  }
]