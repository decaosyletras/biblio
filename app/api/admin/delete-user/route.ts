import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const MAX_BODY_BYTES = 1000
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin")
    const requestOrigin = new URL(request.url).origin

    if (!origin || origin !== requestOrigin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const contentLengthHeader = request.headers.get("content-length")
    const contentLength = Number(contentLengthHeader ?? 0)

    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0 ||
      contentLength > MAX_BODY_BYTES
    ) {
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile?.admin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    let rawBody: string

    try {
      rawBody = await request.text()
    } catch {
      return NextResponse.json(
        { error: "Solicitud inválida" },
        { status: 400 }
      )
    }

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Solicitud demasiado grande" },
        { status: 413 }
      )
    }

    let body: unknown

    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: "Solicitud inválida" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Solicitud inválida" },
        { status: 400 }
      )
    }

    const candidateId = (body as Record<string, unknown>).id
    const id = typeof candidateId === "string" ? candidateId.trim() : ""

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: "Identificador de usuario inválido" },
        { status: 400 }
      )
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      )
    }

    const { data: targetUser, error: targetUserError } =
      await supabaseAdmin.auth.admin.getUserById(id)

    if (targetUserError || !targetUser.user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const { error: claimsError } = await supabaseAdmin
      .from("author_claims")
      .delete()
      .eq("user_id", id)

    if (claimsError) {
      return NextResponse.json(
        { error: "No se pudo eliminar el usuario" },
        { status: 500 }
      )
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id)

    if (profileDeleteError) {
      return NextResponse.json(
        { error: "No se pudo eliminar el usuario" },
        { status: 500 }
      )
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(id)

    if (authDeleteError) {
      return NextResponse.json(
        { error: "No se pudo eliminar el usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el usuario" },
      { status: 500 }
    )
  }
}
