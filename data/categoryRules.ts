export type CategoryRule = {
  id: string
  name: string
  match: (book: {
    genre: string[]
    subgenres: string[]
  }) => boolean
}

export const categoryRules: CategoryRule[] = [
  {
    id: "todos",
    name: "Todos los libros",
    match: () => true,
  },

  // 🌌 CIENCIA FICCIÓN TECNOLÓGICA
  {
    id: "scifi_tecnologica",
    name: "Ciencia ficción tecnológica",
    match: (b) =>
      b.genre.includes("cienciaFiccion") &&
      b.subgenres.some(s =>
        ["cyberpunk", "biopunk", "technothriller"].includes(s)
      )
  },

  // 🪐 CIENCIA FICCIÓN ESPECULATIVA
  {
    id: "scifi_especulativa",
    name: "Ciencia ficción especulativa",
    match: (b) =>
      b.genre.includes("cienciaFiccion") &&
      b.subgenres.some(s =>
        ["realidadesalternas", "utopia", "xenoficcion", "evolucionespeculativa", "especulativo"].includes(s)
      )
  },

  // 🚀 CIENCIA FICCIÓN ESPACIAL
  {
    id: "scifi_espacial",
    name: "Ciencia ficción espacial",
    match: (b) =>
      b.genre.includes("cienciaFiccion") &&
      b.subgenres.some(s =>
        ["exploracionespacial", "operaespacial"].includes(s)
      )
  },

  // ⚔️ THRILLER TECNOLÓGICO / CONSPIRATIVO
  {
    id: "thriller_conspiracion",
    name: "Thriller de conspiración",
    match: (b) =>
      b.genre.includes("thriller") &&
      b.subgenres.some(s =>
        ["conspiracion", "technothriller", "asesinoenserie"].includes(s)
      )
  },

  // 🧠 THRILLER PSICOLÓGICO
  {
    id: "thriller_psicologico",
    name: "Thriller psicológico",
    match: (b) =>
      b.genre.includes("thriller") &&
      b.subgenres.includes("psicologico")
  },

  // 🕵️ MISTERIO ESPECULATIVO
  {
    id: "misterio_especulativo",
    name: "Misterio especulativo",
    match: (b) =>
      b.genre.includes("misterio") &&
      b.subgenres.includes("especulativo")
  },

  // ❤️ ROMANCE (si lo tienes en otros libros)
  {
    id: "romance_enemies",
    name: "Romance enemies to lovers",
    match: (b) =>
      b.genre.includes("romance") &&
      b.subgenres.includes("enemiestolovers")
  },

  // 🌑 TERROR PSICOLÓGICO
  {
    id: "terror_psicologico",
    name: "Terror psicológico",
    match: (b) =>
      b.genre.includes("terror") &&
      b.subgenres.includes("psicologico")
  },

  // 🌌 TERROR CÓSMICO
  {
    id: "terror_cosmico",
    name: "Terror cósmico",
    match: (b) =>
      b.genre.includes("terror") &&
      b.subgenres.includes("cosmico")
  },

  // 📖 FICCIÓN PSICOLÓGICA
  {
    id: "ficcion_psicologica",
    name: "Ficción psicológica",
    match: (b) =>
      b.genre.includes("ficcion") &&
      b.subgenres.includes("psicologico")
  },

  // 🌿 FICCIÓN EMOCIONAL
  {
    id: "ficcion_emocional",
    name: "Ficción emocional",
    match: (b) =>
      b.genre.includes("ficcion") &&
      b.subgenres.includes("emotiva")
  },
]