import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function validateMutationRequest(request: Request) {
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

  return null
}

async function getAuthenticatedContext() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return { supabase, user }
}

async function parseBookId(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return null
  }

  if (!isPlainObject(body)) return null

  const bookId = body.bookId

  return typeof bookId === "string" && UUID_PATTERN.test(bookId)
    ? bookId
    : null
}

async function enforceHiddenWriteLimit(request: Request, userId: string) {
  try {
    return await enforceRateLimit({
      request,
      namespace: "reader-hidden-books-write",
      subject: userId,
      limit: 60,
      windowSeconds: 600,
    })
  } catch {
    return null
  }
}

export async function GET() {
  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { data, error } = await context.supabase
    .from("reader_hidden_books")
    .select("book_id, hidden_at")
    .eq("user_id", context.user.id)
    .order("hidden_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los libros ocultos" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    books: (data ?? []).map((item) => ({
      bookId: item.book_id,
      hiddenAt: item.hidden_at,
    })),
  })
}

export async function PUT(request: Request) {
  const invalidRequest = validateMutationRequest(request)

  if (invalidRequest) return invalidRequest

  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const allowed = await enforceHiddenWriteLimit(request, context.user.id)

  if (allowed === null) {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados cambios. Espera unos minutos." },
      { status: 429 }
    )
  }

  const bookId = await parseBookId(request)

  if (!bookId) {
    return NextResponse.json({ error: "Libro inválido" }, { status: 400 })
  }

  const [
    { data: book, error: bookError },
    { data: libraryBook, error: libraryError },
  ] =
    await Promise.all([
      supabaseAdmin
        .from("books")
        .select("id")
        .eq("id", bookId)
        .eq("approved", true)
        .maybeSingle(),
      context.supabase
        .from("reader_books")
        .select("book_id")
        .eq("user_id", context.user.id)
        .eq("book_id", bookId)
        .maybeSingle(),
    ])

  if (bookError) {
    return NextResponse.json(
      { error: "No se pudo validar el libro" },
      { status: 500 }
    )
  }

  if (libraryError) {
    return NextResponse.json(
      { error: "No se pudo consultar la biblioteca" },
      { status: 500 }
    )
  }

  if (!book) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
  }

  if (libraryBook) {
    return NextResponse.json(
      { error: "Quita primero el libro de tu biblioteca" },
      { status: 409 }
    )
  }

  const { data: existing, error: existingError } = await context.supabase
    .from("reader_hidden_books")
    .select("book_id, hidden_at")
    .eq("user_id", context.user.id)
    .eq("book_id", bookId)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json(
      { error: "No se pudo consultar el libro oculto" },
      { status: 500 }
    )
  }

  if (existing) {
    return NextResponse.json({
      success: true,
      book: { bookId: existing.book_id, hiddenAt: existing.hidden_at },
    })
  }

  const { data, error } = await context.supabase
    .from("reader_hidden_books")
    .insert({ user_id: context.user.id, book_id: bookId })
    .select("book_id, hidden_at")
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "No se pudo ocultar el libro" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    book: { bookId: data.book_id, hiddenAt: data.hidden_at },
  })
}

export async function DELETE(request: Request) {
  const invalidRequest = validateMutationRequest(request)

  if (invalidRequest) return invalidRequest

  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const allowed = await enforceHiddenWriteLimit(request, context.user.id)

  if (allowed === null) {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados cambios. Espera unos minutos." },
      { status: 429 }
    )
  }

  const bookId = await parseBookId(request)

  if (!bookId) {
    return NextResponse.json({ error: "Libro inválido" }, { status: 400 })
  }

  const { error } = await context.supabase
    .from("reader_hidden_books")
    .delete()
    .eq("user_id", context.user.id)
    .eq("book_id", bookId)

  if (error) {
    return NextResponse.json(
      { error: "No se pudo volver a mostrar el libro" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, bookId })
}
