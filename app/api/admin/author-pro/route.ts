import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i

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
      .from("authors")
      .select(
        "id, name, slug, pro, pro_until, stripe_pro_active, complimentary_pro"
      )
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron cargar los autores PRO" },
        { status: 500 }
      )
    }

    return NextResponse.json({ authors: data ?? [] })
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los autores PRO" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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

    const candidate = body as Record<string, unknown>
    const authorId =
      typeof candidate.authorId === "string" ? candidate.authorId : ""
    const enabled = candidate.enabled

    if (!UUID_PATTERN.test(authorId) || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("authors")
      .update({ complimentary_pro: enabled })
      .eq("id", authorId)
      .select(
        "id, name, slug, pro, pro_until, stripe_pro_active, complimentary_pro"
      )
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(
        { error: "No se pudo actualizar la cortesía PRO" },
        { status: 500 }
      )
    }

    return NextResponse.json({ author: data })
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la cortesía PRO" },
      { status: 500 }
    )
  }
}
