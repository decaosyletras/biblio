import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { createClient } from "@/lib/supabase-server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { error: "Solicitud no autorizada" },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (!Number.isFinite(contentLength) || contentLength > 2000) {
    return NextResponse.json(
      { error: "Solicitud demasiado grande" },
      { status: 413 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const allowed = await enforceRateLimit({
      request,
      namespace: "reader-favorites-write",
      subject: user.id,
      limit: 40,
      windowSeconds: 60,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados cambios. Espera un minuto." },
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  if (!isPlainObject(body)) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  const bookId = body.bookId
  const isFavorite = body.isFavorite

  if (
    typeof bookId !== "string" ||
    !UUID_PATTERN.test(bookId) ||
    typeof isFavorite !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Datos de favorito inválidos" },
      { status: 400 }
    )
  }

  const { data: membership, error: membershipError } = await supabase
    .from("reader_books")
    .select("book_id, is_read")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle()

  if (membershipError) {
    return NextResponse.json(
      { error: "No se pudo consultar la biblioteca" },
      { status: 500 }
    )
  }

  if (!membership) {
    return NextResponse.json(
      { error: "El libro no está en tu biblioteca" },
      { status: 404 }
    )
  }

  if (isFavorite && !membership.is_read) {
    return NextResponse.json(
      { error: "Solo puedes elegir como favorito un libro leído" },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from("reader_books")
    .update({ is_favorite: isFavorite })
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .select("book_id, is_favorite, favorited_at")
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "No se pudo actualizar el favorito" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    book: {
      bookId: data.book_id,
      isFavorite: data.is_favorite,
      favoritedAt: data.favorited_at,
    },
  })
}
