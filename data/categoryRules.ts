export type BookInput = {
  genre: string[]
  subgenres: string[]
  metrics?: string[]
  tags?: Record<string, number>
}

type CategoryRule = {
  id: string
  name: string
  description?: string
  threshold: number
  score: (book: BookInput) => number
  match: (book: BookInput) => boolean
}

// --------------------
// HELPERS
// --------------------

const hasAny = (arr: string[] = [], values: string[] = []) =>
  values.some((v) => arr.includes(v))

// --------------------
// BASE CATEGORY (UI ONLY)
// --------------------

export const baseCategory = {
  id: "todos",
  name: "Todos los libros",
  description: "Explora todo el catálogo",
}

// --------------------
// RULES ENGINE
// --------------------

export const categoryRules: CategoryRule[] = [
  // 🌑 MUNDOS OSCUROS Y DISTÓPICOS
  {
    id: "mundos_oscuros",
    name: "Mundos oscuros y distópicos",
    description: "Sociedades rotas, decadentes y moralmente grises",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "oscura",
          "distopia",
          "postapocaliptica",
          "gore",
          "asesinoenserie",
          "cyberpunk",
        ])
      ) s += 2

      if (hasAny(b.genre, ["terror", "cienciaFiccion"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "mundos_oscuros")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 🧠 REALIDAD Y MENTE HUMANA
  {
    id: "mente_realidad",
    name: "Realidad y mente humana",
    description:
      "Psicología, filosofía y distorsión de la percepción de la realidad",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "psicologico",
          "existencial",
          "realidadesalternas",
          "especulativo",
        ])
      ) s += 2

      if (hasAny(b.subgenres, ["utopia", "evolucionespeculativa"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "mente_realidad")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // ⚡ THRILLER Y CONSPIRACIONES
  {
    id: "thriller_conspiracion",
    name: "Thriller y conspiraciones",
    description: "Tensión, crimen, secretos y persecuciones",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "conspiracion",
          "technothriller",
          "policial",
          "asesinoenserie",
        ])
      ) s += 2

      if (hasAny(b.subgenres, ["supervivencia"])) s += 1

      if (hasAny(b.genre, ["thriller"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "thriller_conspiracion")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 🌌 CIENCIA FICCIÓN Y FUTUROS EXTRAÑOS
  {
    id: "scifi_futuros",
    name: "Ciencia ficción y futuros extraños",
    description: "Tecnología, IA, alienígenas y futuros alternativos",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "exploracionespacial",
          "cyberpunk",
          "biopunk",
          "technothriller",
          "xenoficcion",
          "operaespacial",
        ])
      ) s += 2

      if (hasAny(b.genre, ["cienciaFiccion"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "scifi_futuros")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 🌍 GRANDES MUNDOS Y AVENTURAS
  {
    id: "grandes_mundos",
    name: "Grandes mundos y aventuras",
    description: "Épica, exploración y mundos expansivos",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "epica",
          "historica",
          "juvenil",
          "exploracionespacial",
          "operaespacial",
        ])
      ) s += 2

      if (hasAny(b.genre, ["aventura"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "grandes_mundos")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // ❤️ HISTORIAS EMOCIONALES
  {
    id: "emocionales_intensas",
    name: "Historias emocionales intensas",
    description: "Drama, romance y carga emocional alta",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "amorprohibido",
          "enemiestolovers",
          "friendstolovers",
          "emotiva",
        ])
      ) s += 2

      if (hasAny(b.subgenres, ["erotico"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "emocionales_intensas")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 👁️ HORROR Y LO DESCONOCIDO
  {
    id: "horror_desconocido",
    name: "Horror y lo desconocido",
    description: "Sobrenatural, cósmico y terror existencial",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (hasAny(b.subgenres, ["cosmico", "sobrenatural", "existencial"]))
        s += 2

      if (hasAny(b.genre, ["terror"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "horror_desconocido")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // ⚡ SUPERVIVENCIA Y ACCIÓN
  {
    id: "adrenalina_supervivencia",
    name: "Adrenalina y supervivencia",
    description: "Acción, peligro y supervivencia",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (hasAny(b.subgenres, ["supervivencia", "postapocaliptica", "gore"]))
        s += 2

      if (hasAny(b.genre, ["aventura"])) s += 1

      return s
    },
    match: (b) => {
      const rule = categoryRules.find(
        (r) => r.id === "adrenalina_supervivencia"
      )
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 🧭 PARANOIA Y TENSIÓN MENTAL
  {
    id: "paranoia_tension",
    name: "Paranoia y tensión mental",
    description: "Inestabilidad psicológica y conspiración",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (
        hasAny(b.subgenres, [
          "psicologico",
          "conspiracion",
          "realidadesalternas",
        ])
      ) s += 2

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "paranoia_tension")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },

  // 🌱 ESPERANZA
  {
    id: "futuros_esperanzadores",
    name: "Futuros esperanzadores",
    description: "Utopía, redención y esperanza",
    threshold: 2,
    score: (b) => {
      let s = 0

      if (hasAny(b.subgenres, ["utopia", "emotiva", "xenoficcion"])) s += 2

      return s
    },
    match: (b) => {
      const rule = categoryRules.find((r) => r.id === "futuros_esperanzadores")
      return rule ? rule.score(b) >= rule.threshold : false
    },
  },
]