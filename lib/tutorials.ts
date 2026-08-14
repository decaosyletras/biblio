import { createClient } from "@/lib/supabase-server"

export const TUTORIAL_SLUGS = ["autores", "lectores"] as const

export type TutorialSlug = (typeof TUTORIAL_SLUGS)[number]

export type TutorialStep = {
  id: string
  title: string
  text: string
  imagePath: string | null
  imageUrl?: string | null
}

export type Tutorial = {
  slug: TutorialSlug
  title: string
  description: string
  sortOrder: number
  steps: TutorialStep[]
}

export const DEFAULT_TUTORIALS: Tutorial[] = [
  {
    slug: "autores",
    title: "Crea tu página de autor",
    description:
      "Reclama tu autoría y prepara un espacio para conectar con tus lectores.",
    sortOrder: 1,
    steps: [
      {
        id: "a1000000-0000-4000-8000-000000000001",
        title: "Crea tu cuenta o inicia sesión",
        text: "Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000002",
        title: "Entra a Mi espacio",
        text: "Desde aquí podrás administrar tu perfil, biblioteca y página de autor.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000003",
        title: "Encuentra uno de tus libros",
        text: "Busca una obra tuya en el catálogo y abre su ficha.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000004",
        title: "Reclama tu autor",
        text: "Pulsa Reclamar autor y envía los datos de verificación. Solo necesitas reclamar uno de tus libros.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000005",
        title: "Espera la aprobación",
        text: "Revisaremos tu solicitud. Puedes consultar su estado desde Mi espacio.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000006",
        title: "Edita tu página",
        text: "Cuando sea aprobada, entra a Mi espacio y pulsa Editar mi página.",
        imagePath: null,
      },
      {
        id: "a1000000-0000-4000-8000-000000000007",
        title: "Personaliza y revisa tu página",
        text: "Completa la información que quieras, guarda los cambios y revisa cómo la verán tus lectores.",
        imagePath: null,
      },
    ],
  },
  {
    slug: "lectores",
    title: "Crea tu perfil de lector",
    description:
      "Organiza tus lecturas y decide qué quieres compartir con otras personas.",
    sortOrder: 2,
    steps: [
      {
        id: "b1000000-0000-4000-8000-000000000001",
        title: "Crea tu cuenta o inicia sesión",
        text: "Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000002",
        title: "Entra a Mi espacio",
        text: "Desde aquí podrás administrar tu perfil, biblioteca y página de autor.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000003",
        title: "Crea tu perfil lector",
        text: "Desde Mi espacio, pulsa Crear perfil lector.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000004",
        title: "Personaliza tu perfil",
        text: "Añade tus datos y elige qué información quieres mostrar públicamente.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000005",
        title: "Abre Mi biblioteca",
        text: "Entra a Mi biblioteca para organizar tus lecturas.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000006",
        title: "Agrega y organiza tus libros",
        text: "Desde Biblioteca general puedes agregar libros, marcarlos como leídos y elegir tus favoritos.",
        imagePath: null,
      },
      {
        id: "b1000000-0000-4000-8000-000000000007",
        title: "Revisa tu perfil",
        text: "Vuelve a Mi espacio para comprobar qué información se muestra en tu perfil público.",
        imagePath: null,
      },
    ],
  },
]

type TutorialRow = {
  slug: string
  title: string
  description: string
  sort_order: number
  steps: unknown
}

export function isTutorialSlug(value: string): value is TutorialSlug {
  return TUTORIAL_SLUGS.includes(value as TutorialSlug)
}

export function getTutorialImageUrl(imagePath: string | null) {
  if (!imagePath) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  return `${supabaseUrl}/storage/v1/object/public/tutorial-images/${encodeURI(imagePath)}`
}

export function mapTutorialRow(row: TutorialRow): Tutorial | null {
  if (!isTutorialSlug(row.slug) || !Array.isArray(row.steps)) return null

  const steps = row.steps.flatMap((step): TutorialStep[] => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return []

    const candidate = step as Record<string, unknown>
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.text !== "string"
    ) {
      return []
    }

    const imagePath =
      typeof candidate.imagePath === "string" ? candidate.imagePath : null

    return [
      {
        id: candidate.id,
        title: candidate.title,
        text: candidate.text,
        imagePath,
        imageUrl: getTutorialImageUrl(imagePath),
      },
    ]
  })

  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    steps,
  }
}

export async function getPublicTutorials() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tutorials")
      .select("slug, title, description, sort_order, steps")
      .order("sort_order", { ascending: true })

    if (error || !data) return DEFAULT_TUTORIALS

    const tutorials = data
      .map((row) => mapTutorialRow(row as TutorialRow))
      .filter((tutorial): tutorial is Tutorial => tutorial !== null)

    return tutorials.length > 0 ? tutorials : DEFAULT_TUTORIALS
  } catch {
    return DEFAULT_TUTORIALS
  }
}
