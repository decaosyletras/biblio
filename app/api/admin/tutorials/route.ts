import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import {
  getTutorialImageUrl,
  isTutorialActionHref,
  isTutorialSlug,
  mapTutorialRow,
  type TutorialStep,
} from "@/lib/tutorials"

export const dynamic = "force-dynamic"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const IMAGE_PATH_PATTERN =
  /^(autores|lectores)\/[0-9a-f-]{36}\.webp$/i

async function getAdminUser() {
  const authClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser()

  if (authError || !user) return { status: 401 as const, user: null }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile?.admin) {
    return { status: 403 as const, user: null }
  }

  return { status: 200 as const, user }
}

function parseSteps(value: unknown, slug: string): TutorialStep[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
    return null
  }

  const ids = new Set<string>()
  const steps: TutorialStep[] = []

  for (const valueStep of value) {
    if (!valueStep || typeof valueStep !== "object" || Array.isArray(valueStep)) {
      return null
    }

    const step = valueStep as Record<string, unknown>
    const title = typeof step.title === "string" ? step.title.trim() : ""
    const text = typeof step.text === "string" ? step.text.trim() : ""
    const imagePath =
      typeof step.imagePath === "string" && step.imagePath.trim()
        ? step.imagePath.trim()
        : null
    const rawActions = step.actions

    if (!Array.isArray(rawActions) || rawActions.length > 2) return null

    const actions = rawActions.flatMap((rawAction) => {
      if (
        !rawAction ||
        typeof rawAction !== "object" ||
        Array.isArray(rawAction)
      ) {
        return []
      }

      const action = rawAction as Record<string, unknown>
      const label = typeof action.label === "string" ? action.label.trim() : ""
      const href = typeof action.href === "string" ? action.href.trim() : ""

      return label &&
        label.length <= 80 &&
        href.length <= 200 &&
        isTutorialActionHref(href)
        ? [{ label, href }]
        : []
    })

    if (
      typeof step.id !== "string" ||
      !UUID_PATTERN.test(step.id) ||
      ids.has(step.id) ||
      title.length === 0 ||
      title.length > 100 ||
      text.length === 0 ||
      text.length > 500 ||
      actions.length !== rawActions.length ||
      (imagePath !== null &&
        (!IMAGE_PATH_PATTERN.test(imagePath) || !imagePath.startsWith(`${slug}/`)))
    ) {
      return null
    }

    ids.add(step.id)
    steps.push({ id: step.id, title, text, imagePath, actions })
  }

  return steps
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin.user) {
      return NextResponse.json(
        { error: admin.status === 401 ? "No autenticado" : "No autorizado" },
        { status: admin.status }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("tutorials")
      .select("slug, title, description, sort_order, steps")
      .order("sort_order", { ascending: true })

    if (error || !data) {
      return NextResponse.json(
        { error: "No se pudieron cargar los tutoriales" },
        { status: 500 }
      )
    }

    const tutorials = data
      .map((row) => mapTutorialRow(row))
      .filter((tutorial) => tutorial !== null)

    return NextResponse.json({ tutorials })
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los tutoriales" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const origin = request.headers.get("origin")
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const admin = await getAdminUser()
    if (!admin.user) {
      return NextResponse.json(
        { error: admin.status === 401 ? "No autenticado" : "No autorizado" },
        { status: admin.status }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    const tutorial = (body as Record<string, unknown>).tutorial
    if (!tutorial || typeof tutorial !== "object" || Array.isArray(tutorial)) {
      return NextResponse.json({ error: "Tutorial inválido" }, { status: 400 })
    }

    const candidate = tutorial as Record<string, unknown>
    const slug = typeof candidate.slug === "string" ? candidate.slug : ""
    const title = typeof candidate.title === "string" ? candidate.title.trim() : ""
    const description =
      typeof candidate.description === "string" ? candidate.description.trim() : ""
    const steps = parseSteps(candidate.steps, slug)

    if (
      !isTutorialSlug(slug) ||
      title.length === 0 ||
      title.length > 100 ||
      description.length > 300 ||
      !steps
    ) {
      return NextResponse.json(
        { error: "Revisa el título, la descripción y los pasos" },
        { status: 400 }
      )
    }

    const { data: previous } = await supabaseAdmin
      .from("tutorials")
      .select("steps")
      .eq("slug", slug)
      .maybeSingle()

    const { data: saved, error: saveError } = await supabaseAdmin
      .from("tutorials")
      .update({
        title,
        description,
        steps: steps.map(({ id, title: stepTitle, text, imagePath, actions }) => ({
          id,
          title: stepTitle,
          text,
          imagePath,
          actions,
        })),
        updated_at: new Date().toISOString(),
        updated_by: admin.user.id,
      })
      .eq("slug", slug)
      .select("slug, title, description, sort_order, steps")
      .maybeSingle()

    if (saveError || !saved) {
      return NextResponse.json(
        { error: "No se pudo guardar el tutorial" },
        { status: 500 }
      )
    }

    const previousPaths = Array.isArray(previous?.steps)
      ? previous.steps.flatMap((step) => {
          if (!step || typeof step !== "object" || Array.isArray(step)) return []
          const path = (step as Record<string, unknown>).imagePath
          return typeof path === "string" ? [path] : []
        })
      : []
    const savedPaths = new Set(
      steps.flatMap((step) => (step.imagePath ? [step.imagePath] : []))
    )
    const unusedPaths = previousPaths.filter((path) => !savedPaths.has(path))

    if (unusedPaths.length > 0) {
      await supabaseAdmin.storage.from("tutorial-images").remove(unusedPaths)
    }

    const result = mapTutorialRow(saved)
    if (result) {
      result.steps = result.steps.map((step) => ({
        ...step,
        imageUrl: getTutorialImageUrl(step.imagePath),
      }))
    }

    return NextResponse.json({ tutorial: result })
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el tutorial" },
      { status: 500 }
    )
  }
}
