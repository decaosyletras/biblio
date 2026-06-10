import { books } from "../data/books"
import fs from "fs"
import path from "path"

// ===== DICCIONARIO GRANDE =====
const dictionary: Record<string, string[]> = {

  // =========================
  // ACCIÓN / AVENTURA
  // =========================
  aventura: ["aventura", "exploración", "expedición", "viaje peligroso"],
  accion: ["acción", "persecución", "combate", "tiroteo", "explosión"],
  supervivencia: ["supervivencia", "sobrevivir", "aislamiento", "hostil", "desierto", "selva"],

  // =========================
  // SCI-FI / TECNOLOGÍA
  // =========================
  cienciadura: ["ciencia dura", "hard sci-fi", "física", "astrofísica", "tecnología realista"],
  ia: ["ia", "inteligencia artificial", "algoritmo", "conciencia artificial", "machine learning"],
  realidadvirtual: ["realidad virtual", "simulación", "metaverso", "virtual", "simulado"],
  viajestiempo: ["viaje en el tiempo", "línea temporal", "paradoja temporal", "cronología"],
  razasalienigenas: ["alien", "alienígena", "extraterrestre", "raza no humana", "especie"],

  colonizacionexpansion: ["colonización", "expansión", "imperio", "territorio", "conquista espacial"],

  // =========================
  // MILITAR / POLÍTICO
  // =========================
  militar: ["militar", "ejército", "soldado", "guerra", "batallón"],
  rebelion: ["rebelión", "revolución", "levantamiento", "insurrección"],
  conspiracion: ["conspiración", "complot", "intriga", "trama secreta"],
  cuenta_regresiva: ["cuenta regresiva", "deadline", "tiempo limitado", "urgencia"],

  // =========================
  // ARQUETIPOS / NARRATIVA
  // =========================
  viajedelheroe: ["viaje del héroe", "llamado a la aventura", "arco heroico", "transformación"],
  mentoraprendiz: ["mentor", "aprendiz", "maestro", "discípulo", "guía"],
  villanocarismatico: ["villano carismático", "antagonista complejo", "antiheroe oscuro"],

  historiasparalelas: ["historias paralelas", "múltiples líneas", "narrativa dual", "estructura fragmentada"],
  misterioaresolver: ["misterio", "caso", "investigación", "enigma", "crimen sin resolver"],

  // =========================
  // EMOCIONAL / TEMÁTICO
  // =========================
  drama: ["drama", "tragedia", "conflicto emocional"],
  humor: ["humor", "comedia", "satírico", "ironía", "parodia"],
  satira: ["sátira", "crítica social", "burla", "ironía política"],

  reflexion: ["reflexión", "filosófico", "pensamiento", "meditación"],
  existencial: ["existencial", "sentido de la vida", "vacío", "absurdo", "existencia"],

  espiritualidad: ["espiritualidad", "alma", "trascendencia", "iluminación"],
  misticismo: ["misticismo", "místico", "rituales", "oculto", "esotérico"],

  traicion: ["traición", "engaño", "lealtad rota", "doble juego"],
  redencion: ["redención", "perdón", "salvación", "segundas oportunidades"],
  soledad: ["soledad", "aislamiento", "abandono", "vacío emocional"],

  // =========================
  // SOCIAL / CONTEMPORÁNEO
  // =========================
  lgbt: ["lgbt", "queer", "identidad sexual", "orientación sexual", "diversidad"],

  pandemia: ["pandemia", "virus", "epidemia", "contagio", "cuarentena"],

  // =========================
  // TIEMPO / PASADO
  // =========================
  pasadoorigenes: ["pasado", "orígenes", "infancia", "memoria", "raíces"],

  // =========================
  // EXTRA SCI-FI / PROFUNDO
  // =========================
  inmortalidad: ["inmortalidad", "vida eterna", "eterno", "no muerte"],

  // =========================
  // IMPORTANTE: CORRECCIÓN
  // =========================
  dragones: ["dragón", "dragones", "bestia mítica", "criatura fantástica"],
}

// ===== NORMALIZADOR =====
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

// ===== EXTRACTOR =====
function extractTags(book: any): string[] {
  const text = normalize(
    `${book.title} ${book.summary} ${book.genre?.join(" ")} ${book.subgenres?.join(" ")} ${book.review?.excerpt || ""}`
  )

  const tags: string[] = []

  for (const [tag, keywords] of Object.entries(dictionary)) {
    if (keywords.some(k => text.includes(normalize(k)))) {
      tags.push(tag)
    }
  }

  return [...new Set(tags)]
}

// ===== PROCESAR =====
const enriched = books.map((book) => {
  const autoTags = extractTags(book)

  return {
    ...book,

    review: {
      ...book.review,
      metrics: [
        ...(book.review.metrics || []), // tus tags manuales
        ...autoTags                    // tags automáticos
      ]
    }
  }
})

// ===== GUARDAR OUTPUT =====
const outputPath = path.resolve("data/books.enriched.ts")

fs.writeFileSync(
  outputPath,
  `import { Book } from "@/types"

export const books: Book[] = ${JSON.stringify(enriched, null, 2)}
`
)

console.log("✔ books.enriched.ts generado correctamente")