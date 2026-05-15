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

const countMatches = (
  arr: string[] = [],
  values: string[] = []
): number => values.filter((v) => arr.includes(v)).length

const countMetrics = (
  metrics: string[] = [],
  values: string[] = []
): number => values.filter((v) => metrics.includes(v)).length



const categoryMetricsMap: Record<string, string[]> = {
  mundos_oscuros: [
    "rebelion",
    "militar",
    "soledad",
    "pandemia",
    "traicion",
  ],

  mente_realidad: [
    "existencial",
    "reflexion",
    "espiritualidad",
    "misticismo",
    "soledad",
  ],

  thriller_conspiracion: [
    "conspiracion",
    "misterioaresolver",
    "cuentaregresiva",
    "traicion",
  ],

  scifi_futuros: [
    "ia",
    "realidadvirtual",
    "viajestiempo",
    "colonizacionexpansion",
    "razasalienigenas",
  ],

  grandes_mundos: [
    "aventura",
    "juvenil",
    "viajedelheroe",
    "colonizacionexpansion",
  ],

  emocionales_intensas: [
    "drama",
    "soledad",
    "redencion",
    "traicion",
  ],

  horror_desconocido: [
    "misticismo",
    "pandemia",
    "soledad",
  ],

  adrenalina_supervivencia: [
    "accion",
    "militar",
    "supervivencia",
    "cuentaregresiva",
  ],

  paranoia_tension: [
    "conspiracion",
    "soledad",
    "misterioaresolver",
    "existencial",
  ],

  futuros_esperanzadores: [
    "redencion",
    "espiritualidad",
    "misticismo",
  ],
}

// --------------------
// BASE CATEGORY (UI ONLY)
// --------------------

export const baseCategory = {
  id: "todos",
  name: "Todos los libros",
  description: "Explora todo el catálogo",
}

// --------------------
// MATCH HELPER
// --------------------

const createMatch = (
  id: string,
  rules: CategoryRule[]
) => (book: BookInput) => {
  const rule = rules.find((r) => r.id === id)
  return rule ? rule.score(book) >= rule.threshold : false
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
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "oscura",
          "distopia",
          "postapocaliptica",
          "gore",
          "asesinoenserie",
          "cyberpunk",
        ]) * 2

      s += countMatches(b.genre, ["terror", "cienciaFiccion"]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.mundos_oscuros) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "mundos_oscuros")!.score(b) >= 4,
  },

  // 🧠 REALIDAD Y MENTE HUMANA
  {
    id: "mente_realidad",
    name: "Realidad y mente humana",
    description:
      "Psicología, filosofía y distorsión de la percepción de la realidad",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "psicologico",
          "existencial",
          "realidadesalternas",
          "especulativo",
          "conspiracion",
          "utopia",
          "evolucionespeculativa",
        ]) * 2

      s += countMatches(b.genre, [
      ]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.mente_realidad) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "mente_realidad")!.score(b) >= 4,
  },

  // ⚡ THRILLER Y CONSPIRACIONES
  {
    id: "thriller_conspiracion",
    name: "Thriller y conspiraciones",
    description: "Tensión, crimen, secretos y persecuciones",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "conspiracion",
          "technothriller",
          "policial",
          "asesinoenserie",
        ]) * 2

      s += countMatches(b.subgenres, ["supervivencia"]) * 2

      s += countMatches(b.genre, ["thriller"]) * 2

      s += countMetrics(
        b.metrics,
        categoryMetricsMap.thriller_conspiracion
      ) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "thriller_conspiracion")!.score(b) >= 4,
  },

  // 🌌 CIENCIA FICCIÓN Y FUTUROS EXTRAÑOS
  {
    id: "scifi_futuros",
    name: "Ciencia ficción y futuros extraños",
    description: "Tecnología, IA, alienígenas y futuros alternativos",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "exploracionespacial",
          "cyberpunk",
          "biopunk",
          "technothriller",
          "xenoficcion",
          "operaespacial",
        ]) * 2

      s += countMatches(b.genre, ["cienciaFiccion"]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.scifi_futuros) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "scifi_futuros")!.score(b) >= 4,
  },

  // 🌍 GRANDES MUNDOS Y AVENTURAS
  {
    id: "grandes_mundos",
    name: "Grandes mundos y aventuras",
    description: "Épica, exploración y mundos expansivos",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "epica",
          "historica",
          "juvenil",
          "exploracionespacial",
          "operaespacial",
        ]) * 2

      s += countMatches(b.genre, ["aventura"]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.grandes_mundos) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "grandes_mundos")!.score(b) >= 4,
  },

  // ❤️ HISTORIAS EMOCIONALES
  {
    id: "emocionales_intensas",
    name: "Historias emocionales intensas",
    description: "Drama, romance y carga emocional alta",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "amorprohibido",
          "enemiestolovers",
          "friendstolovers",
          "emotiva",
        ]) * 2

      s += countMatches(b.genre, ["romance"]) * 2

      s += countMetrics(
        b.metrics,
        categoryMetricsMap.emocionales_intensas
      ) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "emocionales_intensas")!.score(b) >= 4,
  },

  // 👁️ HORROR Y LO DESCONOCIDO
  {
    id: "horror_desconocido",
    name: "Horror y lo desconocido",
    description: "Sobrenatural, cósmico y terror existencial",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "cosmico",
          "sobrenatural",
          "existencial",
        ]) * 2

      s += countMatches(b.genre, ["terror"]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.horror_desconocido) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "horror_desconocido")!.score(b) >= 4,
  },

  // ⚡ SUPERVIVENCIA Y ACCIÓN
  {
    id: "adrenalina_supervivencia",
    name: "Adrenalina y supervivencia",
    description: "Acción, peligro y supervivencia",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "supervivencia",
          "postapocaliptica",
          "gore",
        ]) * 2

      s += countMatches(b.genre, ["aventura"]) * 2

      s += countMetrics(
        b.metrics,
        categoryMetricsMap.adrenalina_supervivencia
      ) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "adrenalina_supervivencia" )!.score(b) >= 4,
  },

  // 🧭 PARANOIA Y TENSIÓN MENTAL
  {
    id: "paranoia_tension",
    name: "Paranoia y tensión mental",
    description: "Inestabilidad psicológica y conspiración",
    threshold: 4,

    score: (b) => {
      let s = 0

      s +=
        countMatches(b.subgenres, [
          "psicologico",
          "conspiracion",
          "realidadesalternas",
        ]) * 2

      s += countMetrics(b.metrics, categoryMetricsMap.paranoia_tension) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "paranoia_tension")!.score(b) >= 4,
  },

  // 🌱 ESPERANZA
  {
    id: "futuros_esperanzadores",
    name: "Futuros esperanzadores",
    description: "Utopía, redención y esperanza",
    threshold: 4,

    score: (b) => {
      let s = 0

      s += countMatches(b.subgenres, [
        "utopia",
        "emotiva",
        "xenoficcion",
      ]) * 2

      s += countMetrics(
        b.metrics,
        categoryMetricsMap.futuros_esperanzadores
      ) * 2

      return s
    },

    match: (b) =>
      categoryRules.find((r) => r.id === "futuros_esperanzadores")!.score(b) >= 4,
  },
]