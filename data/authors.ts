import { Author } from "@/types"
import { books } from "./books"

export const authors: Author[] = [
  {
    slug: "autor-x",
    name: "Autor X",
    avatar: "/avatar.jpg",
    bio: "Escritor independiente.",
    books: books
  }
]