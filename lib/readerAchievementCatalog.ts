export type ReaderAchievementMode = "permanent" | "active"

export type ReaderAchievementIcon =
  | "badge"
  | "book"
  | "bookmark"
  | "calendar"
  | "compass"
  | "heart"
  | "image"
  | "library"
  | "map"
  | "medal"
  | "sparkles"
  | "users"

export type ReaderAchievementKey =
  | "profile-identity"
  | "first-shelf"
  | "first-read"
  | "recommendation-image"
  | "library-image"
  | "first-favorite"
  | "library-5"
  | "library-25"
  | "read-5"
  | "read-25"
  | "genres-3"
  | "genres-5"
  | "subgenres-5"
  | "authors-5"
  | "same-author-3"
  | "sagas-3"
  | "lectometer-3"
  | "dated-reads-5"
  | "favorites-10"
  | "favorite-genres-3"

export type ReaderAchievementDefinition = {
  key: ReaderAchievementKey
  title: string
  description: string
  mode: ReaderAchievementMode
  target: number
  icon: ReaderAchievementIcon
}

export type ReaderAchievementStatus = ReaderAchievementDefinition & {
  current: number
  isActive: boolean
  firstUnlockedAt: string | null
}

export const READER_ACHIEVEMENTS: readonly ReaderAchievementDefinition[] = [
  {
    key: "profile-identity",
    title: "Perfil con identidad",
    description: "Creaste tu perfil de lector.",
    mode: "permanent",
    target: 1,
    icon: "badge",
  },
  {
    key: "first-shelf",
    title: "Primer estante",
    description: "Agregaste tu primer libro a la biblioteca.",
    mode: "permanent",
    target: 1,
    icon: "library",
  },
  {
    key: "first-read",
    title: "Primera lectura registrada",
    description: "Marcaste tu primer libro como leído.",
    mode: "permanent",
    target: 1,
    icon: "book",
  },
  {
    key: "recommendation-image",
    title: "Voz recomendadora",
    description: "Creaste tu primera imagen para recomendar un libro.",
    mode: "permanent",
    target: 1,
    icon: "sparkles",
  },
  {
    key: "library-image",
    title: "Biblioteca en una imagen",
    description: "Creaste una imagen personalizada de tu biblioteca.",
    mode: "permanent",
    target: 1,
    icon: "image",
  },
  {
    key: "first-favorite",
    title: "Primera joya",
    description: "Mantén al menos un libro entre tus favoritos.",
    mode: "active",
    target: 1,
    icon: "heart",
  },
  {
    key: "library-5",
    title: "Biblioteca en marcha",
    description: "Mantén 5 libros en tu biblioteca.",
    mode: "active",
    target: 5,
    icon: "library",
  },
  {
    key: "library-25",
    title: "Gran estantería indie",
    description: "Mantén 25 libros en tu biblioteca.",
    mode: "active",
    target: 25,
    icon: "library",
  },
  {
    key: "read-5",
    title: "Lector en marcha",
    description: "Mantén 5 libros marcados como leídos.",
    mode: "active",
    target: 5,
    icon: "book",
  },
  {
    key: "read-25",
    title: "Lector dedicado",
    description: "Mantén 25 libros marcados como leídos.",
    mode: "active",
    target: 25,
    icon: "medal",
  },
  {
    key: "genres-3",
    title: "Explorador indie",
    description: "Lee libros de 3 géneros distintos.",
    mode: "active",
    target: 3,
    icon: "compass",
  },
  {
    key: "genres-5",
    title: "Sin fronteras",
    description: "Lee libros de 5 géneros distintos.",
    mode: "active",
    target: 5,
    icon: "map",
  },
  {
    key: "subgenres-5",
    title: "Cartógrafo de historias",
    description: "Recorre 5 subgéneros distintos.",
    mode: "active",
    target: 5,
    icon: "map",
  },
  {
    key: "authors-5",
    title: "Nuevas voces",
    description: "Lee obras de 5 autores distintos.",
    mode: "active",
    target: 5,
    icon: "users",
  },
  {
    key: "same-author-3",
    title: "Reencuentro literario",
    description: "Lee 3 libros de un mismo autor.",
    mode: "active",
    target: 3,
    icon: "bookmark",
  },
  {
    key: "sagas-3",
    title: "Espíritu de saga",
    description: "Lee 3 libros que formen parte de sagas.",
    mode: "active",
    target: 3,
    icon: "book",
  },
  {
    key: "lectometer-3",
    title: "Bajo el sello de la L",
    description: "Lee 3 libros analizados por cas(z)a de libros.",
    mode: "active",
    target: 3,
    icon: "badge",
  },
  {
    key: "dated-reads-5",
    title: "Memoria lectora",
    description: "Asigna un año de lectura a 5 libros.",
    mode: "active",
    target: 5,
    icon: "calendar",
  },
  {
    key: "favorites-10",
    title: "Curador indie",
    description: "Mantén 10 libros entre tus favoritos.",
    mode: "active",
    target: 10,
    icon: "heart",
  },
  {
    key: "favorite-genres-3",
    title: "Corazón ecléctico",
    description: "Ten favoritos de 3 géneros distintos.",
    mode: "active",
    target: 3,
    icon: "heart",
  },
] as const

export const READER_ACHIEVEMENT_KEYS = new Set<ReaderAchievementKey>(
  READER_ACHIEVEMENTS.map((achievement) => achievement.key)
)
