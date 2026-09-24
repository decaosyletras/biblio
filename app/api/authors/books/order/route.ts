import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_BOOKS = 500

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
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

    if (contentLength > 50000) {
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
    const bookIds = body.bookIds

    if (
      typeof authorId !== "string" ||
      !UUID_PATTERN.test(authorId) ||
      !Array.isArray(bookIds) ||
      bookIds.length > MAX_BOOKS ||
      !bookIds.every(
        (bookId): bookId is string =>
          typeof bookId === "string" && UUID_PATTERN.test(bookId)
      ) ||
      new Set(bookIds).size !== bookIds.length
    ) {
      return NextResponse.json(
        { error: "Orden de libros invalido" },
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

    const [directResult, relationResult] = await Promise.all([
      supabaseAdmin
        .from("books")
        .select("id")
        .eq("author_id", authorId),
      supabaseAdmin
        .from("book_authors")
        .select("book_id")
        .eq("author_id", authorId),
    ])

    if (directResult.error || relationResult.error) {
      return NextResponse.json(
        { error: "No se pudieron verificar los libros del autor" },
        { status: 500 }
      )
    }

    const associatedBookIds = [
      ...new Set([
        ...(directResult.data ?? []).map((book) => book.id),
        ...(relationResult.data ?? []).map((relation) => relation.book_id),
      ]),
    ]

    const { data: approvedBooks, error: approvedBooksError } =
      associatedBookIds.length > 0
        ? await supabaseAdmin
            .from("books")
            .select("id")
            .in("id", associatedBookIds)
            .eq("approved", true)
        : { data: [], error: null }

    if (approvedBooksError) {
      return NextResponse.json(
        { error: "No se pudieron verificar los libros del autor" },
        { status: 500 }
      )
    }

    const allowedBookIds = new Set(
      (approvedBooks ?? []).map((book) => book.id)
    )

    if (
      bookIds.length !== allowedBookIds.size ||
      !bookIds.every((bookId) => allowedBookIds.has(bookId))
    ) {
      return NextResponse.json(
        { error: "La lista de libros ya no coincide con el catalogo del autor" },
        { status: 409 }
      )
    }

    if (bookIds.length === 0) {
      return NextResponse.json({ success: true })
    }

    const { error: orderError } = await supabaseAdmin
      .from("author_book_settings")
      .upsert(
        bookIds.map((bookId, index) => ({
          author_id: authorId,
          book_id: bookId,
          author_order: index,
        })),
        { onConflict: "author_id,book_id" }
      )

    if (orderError) {
      return NextResponse.json(
        { error: "No se pudo guardar el orden de los libros" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Error guardando el orden de los libros" },
      { status: 500 }
    )
  }
}
