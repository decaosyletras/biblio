import { createClient } from "@/lib/supabase-server"

export const TUTORIAL_SLUGS = ["autores", "lectores"] as const
const TUTORIAL_ACTION_HREF_PATTERN = /^\/(?!\/)[a-z0-9/_#?=&.\-]*$/i

export type TutorialSlug = (typeof TUTORIAL_SLUGS)[number]

export type TutorialStep = {
  id: string
  title: string
  text: string
  imagePath: string | null
  imageUrl?: string | null
  actions: TutorialStepAction[]
}

export type TutorialStepAction = {
  label: string
  href: string
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
        actions: [
          { label: "Iniciar sesión", href: "/login" },
          { label: "Crear mi cuenta", href: "/register" },
        ],
      },
      {
        id: "a1000000-0000-4000-8000-000000000002",
        title: "Entra a Mi espacio",
        text: "Desde aquí podrás administrar tu perfil, biblioteca y página de autor.",
        imagePath: null,
        actions: [{ label: "Ir a Mi espacio", href: "/me" }],
      },
      {
        id: "a1000000-0000-4000-8000-000000000003",
        title: "Busca tu autor",
        text: "Si uno de tus libros ya aparece en el catálogo, abre su ficha y selecciona Reclamar autor.",
        imagePath: null,
        actions: [
          { label: "Buscar uno de mis libros", href: "/libros" },
          { label: "Mi libro no aparece: agregarlo", href: "/contact" },
        ],
      },
      {
        id: "a1000000-0000-4000-8000-000000000006",
        title: "Edita tu página",
        text: "Cuando tengas acceso aprobado, entra a Mi espacio y pulsa Editar mi página.",
        imagePath: null,
        actions: [
          { label: "Abrir mi espacio de autor", href: "/me#mis-solicitudes" },
        ],
      },
      {
        id: "a1000000-0000-4000-8000-000000000007",
        title: "Personaliza y revisa tu página",
        text: "Completa la información que quieras, guarda los cambios y revisa cómo la verán tus lectores.",
        imagePath: null,
        actions: [
          { label: "Continuar con mi página", href: "/me#mis-solicitudes" },
        ],
      },
      {
        id: "a1000000-0000-4000-8000-000000000008",
        title: "Explora la web",
        text: "Explora y conoce todas las opciones que tenemos para tu página de autor. ✨",
        imagePath: null,
        actions: [
          { label: "Descubrir autores", href: "/authors" },
          { label: "Explorar libros", href: "/libros" },
        ],
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
        actions: [
          { label: "Iniciar sesión", href: "/login" },
          { label: "Crear mi cuenta", href: "/register" },
        ],
      },
      {
        id: "b1000000-0000-4000-8000-000000000002",
        title: "Entra a Mi espacio",
        text: "Desde aquí podrás administrar tu perfil, biblioteca y página de autor.",
        imagePath: null,
        actions: [{ label: "Ir a Mi espacio", href: "/me" }],
      },
      {
        id: "b1000000-0000-4000-8000-000000000003",
        title: "Crea tu perfil lector",
        text: "Desde Mi espacio, pulsa Crear perfil lector.",
        imagePath: null,
        actions: [{ label: "Crear mi perfil lector", href: "/me/profile" }],
      },
      {
        id: "b1000000-0000-4000-8000-000000000004",
        title: "Personaliza tu perfil",
        text: "Añade tus datos y elige qué información quieres mostrar públicamente.",
        imagePath: null,
        actions: [{ label: "Configurar mi perfil", href: "/me/profile" }],
      },
      {
        id: "b1000000-0000-4000-8000-000000000005",
        title: "Abre Mi biblioteca",
        text: "Entra a Mi biblioteca para organizar tus lecturas.",
        imagePath: null,
        actions: [{ label: "Abrir Mi biblioteca", href: "/me/library" }],
      },
      {
        id: "b1000000-0000-4000-8000-000000000006",
        title: "Agrega y organiza tus libros",
        text: "Desde Biblioteca general puedes agregar libros o marcarlos como leídos. Después, entra a Mi biblioteca para organizar tus lecturas y elegir tus favoritos.",
        imagePath: null,
        actions: [
          { label: "Explorar biblioteca general", href: "/book-directory" },
          { label: "Organizar Mi biblioteca", href: "/me/library" },
        ],
      },
      {
        id: "b1000000-0000-4000-8000-000000000007",
        title: "Explora la web",
        text: "Explora y conoce todas las opciones que tenemos para tu perfil de lector. ✨",
        imagePath: null,
        actions: [
          { label: "Descubrir lectores", href: "/readers" },
          { label: "Explorar libros", href: "/libros" },
        ],
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

export function isTutorialActionHref(value: string) {
  return value.length <= 200 && TUTORIAL_ACTION_HREF_PATTERN.test(value)
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
    const actions = Array.isArray(candidate.actions)
      ? candidate.actions.slice(0, 2).flatMap((action): TutorialStepAction[] => {
          if (!action || typeof action !== "object" || Array.isArray(action)) {
            return []
          }

          const actionCandidate = action as Record<string, unknown>
          const label =
            typeof actionCandidate.label === "string"
              ? actionCandidate.label.trim()
              : ""
          const href =
            typeof actionCandidate.href === "string"
              ? actionCandidate.href.trim()
              : ""

          return label && label.length <= 80 && isTutorialActionHref(href)
            ? [{ label, href }]
            : []
        })
      : []

    return [
      {
        id: candidate.id,
        title: candidate.title,
        text: candidate.text,
        imagePath,
        imageUrl: getTutorialImageUrl(imagePath),
        actions,
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
