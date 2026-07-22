import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const BASIC_FIELDS = new Set([
  "avatar",
  "bio",
  "description",
  "style",
  "featured_book_id",
  "show_bibliography",
])

const PRO_FIELDS = new Set([
  "contact_email",
  "show_book_details",
  "banner",
  "website",
  "instagram",
  "threads",
  "facebook",
  "tiktok",
  "youtube",
  "wattpad",
  "current_news",
  "social_order",
  "news",
  "theme",
])

const STRING_FIELDS = new Set([
  "avatar",
  "bio",
  "description",
  "style",
  "contact_email",
  "website",
  "instagram",
  "threads",
  "facebook",
  "tiktok",
  "youtube",
  "wattpad",
  "current_news",
])

const BOOLEAN_FIELDS = new Set([
  "show_bibliography",
  "show_book_details",
])

const SOCIAL_FIELDS = new Set([
  "website",
  "instagram",
  "wattpad",
  "threads",
  "facebook",
  "tiktok",
  "youtube",
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
}

function isSafeUpdateValue(field: string, value: unknown) {
  if (STRING_FIELDS.has(field)) {
    return typeof value === "string" && value.length <= 10000
  }

  if (BOOLEAN_FIELDS.has(field)) {
    return typeof value === "boolean"
  }

  if (field === "banner") {
    return value === null ||
      (typeof value === "string" && value.length <= 2048)
  }

  if (field === "featured_book_id") {
    return value === null ||
      (typeof value === "string" && UUID_PATTERN.test(value))
  }

  if (field === "social_order") {
    return Array.isArray(value) &&
      value.length <= SOCIAL_FIELDS.size &&
      value.every(
        (item) => typeof item === "string" && SOCIAL_FIELDS.has(item)
      ) &&
      new Set(value).size === value.length
  }

  if (field === "news" || field === "theme") {
    return value === null ||
      (
        isPlainObject(value) &&
        JSON.stringify(value).length <= 25000
      )
  }

  return false
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin")
    const requestOrigin = new URL(request.url).origin

    if (origin && origin !== requestOrigin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0)

    if (contentLength > 100000) {
      return NextResponse.json(
        { error: "Solicitud demasiado grande" },
        { status: 413 }
      )
    }

    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }

    if (!isPlainObject(body)) {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }

    const authorId = body.authorId
    const updates = body.updates

    if (
      typeof authorId !== "string" ||
      !UUID_PATTERN.test(authorId) ||
      !isPlainObject(updates)
    ) {
      return NextResponse.json(
        { error: "Datos invalidos" },
        { status: 400 }
      )
    }

    const { data: claim, error: claimError } = await supabaseAdmin
      .from("author_claims")
      .select("id")
      .eq("author_id", authorId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .maybeSingle()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const { data: author, error: authorError } = await supabaseAdmin
      .from("authors")
      .select("pro")
      .eq("id", authorId)
      .maybeSingle()

    if (authorError || !author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      )
    }

    const allowedFields = new Set(BASIC_FIELDS)

    if (author.pro === true) {
      PRO_FIELDS.forEach((field) => allowedFields.add(field))
    }

    const safeUpdates: Record<string, unknown> = {}

    for (const [field, value] of Object.entries(updates)) {
      if (!allowedFields.has(field) || !isSafeUpdateValue(field, value)) {
        return NextResponse.json(
          { error: "El formulario contiene campos no permitidos" },
          { status: 400 }
        )
      }

      safeUpdates[field] = value
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json(
        { error: "No hay cambios validos" },
        { status: 400 }
      )
    }

    if (Object.hasOwn(safeUpdates, "news")) {
      safeUpdates.news_updated_at = new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from("authors")
      .update(safeUpdates)
      .eq("id", authorId)

    if (updateError) {
      return NextResponse.json(
        { error: "No se pudo actualizar el autor" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Error actualizando el autor" },
      { status: 500 }
    )
  }
}
