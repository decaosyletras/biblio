import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { unlockReaderAchievement } from "@/lib/readerAchievements"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function validateMutationRequest(request: Request, maxContentLength = 2000) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { error: "Solicitud no autorizada" },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (!Number.isFinite(contentLength) || contentLength > maxContentLength) {
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

async function parseBody(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return null
  }

  return isPlainObject(body) ? body : null
}

async function enforceLibraryWriteLimit(request: Request, userId: string) {
  try {
    return await enforceRateLimit({
      request,
      namespace: "reader-books-write",
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
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }

  const { data, error } = await context.supabase
    .from("reader_books")
    .select("book_id, is_read, is_favorite, favorited_at, added_at, read_at, read_year, updated_at")
    .eq("user_id", context.user.id)
    .order("added_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "No se pudo cargar la biblioteca" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    books: (data ?? []).map((item) => ({
      bookId: item.book_id,
      isRead: item.is_read,
      isFavorite: item.is_favorite,
      favoritedAt: item.favorited_at,
      addedAt: item.added_at,
      readAt: item.read_at,
      readYear: item.read_year,
      updatedAt: item.updated_at,
    })),
  })
}

export async function PUT(request: Request) {
  const invalidRequest = validateMutationRequest(request)

  if (invalidRequest) return invalidRequest

  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }

  const allowed = await enforceLibraryWriteLimit(request, context.user.id)

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

  const body = await parseBody(request)
  const bookId = body?.bookId
  const isRead = body?.isRead

  if (
    typeof bookId !== "string" ||
    !UUID_PATTERN.test(bookId) ||
    typeof isRead !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Datos de libro invalidos" },
      { status: 400 }
    )
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from("books")
    .select("id")
    .eq("id", bookId)
    .eq("approved", true)
    .maybeSingle()

  if (bookError) {
    return NextResponse.json(
      { error: "No se pudo validar el libro" },
      { status: 500 }
    )
  }

  if (!book) {
    return NextResponse.json(
      { error: "Libro no encontrado" },
      { status: 404 }
    )
  }

  // La API no acepta user_id del navegador. La propiedad de la fila siempre
  // se deriva de la sesión verificada y vuelve a ser comprobada por RLS.
  const { data: existingBook, error: existingBookError } =
    await context.supabase
      .from("reader_books")
      .select("book_id")
      .eq("user_id", context.user.id)
      .eq("book_id", bookId)
      .maybeSingle()

  if (existingBookError) {
    return NextResponse.json(
      { error: "No se pudo consultar la biblioteca" },
      { status: 500 }
    )
  }

  const mutation = existingBook
    ? context.supabase
      .from("reader_books")
      .update({ is_read: isRead })
      .eq("user_id", context.user.id)
      .eq("book_id", bookId)
    : context.supabase
      .from("reader_books")
      .insert({
        user_id: context.user.id,
        book_id: bookId,
        is_read: isRead,
      })

  const { data, error } = await mutation
    .select("book_id, is_read, is_favorite, favorited_at, added_at, read_at, read_year, updated_at")
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "No se pudo actualizar la biblioteca" },
      { status: 500 }
    )
  }

  await Promise.all([
    unlockReaderAchievement(context.user.id, "first-shelf"),
    data.is_read
      ? unlockReaderAchievement(context.user.id, "first-read")
      : Promise.resolve(false),
  ])

  return NextResponse.json({
    success: true,
    book: {
      bookId: data.book_id,
      isRead: data.is_read,
      isFavorite: data.is_favorite,
      favoritedAt: data.favorited_at,
      addedAt: data.added_at,
      readAt: data.read_at,
      readYear: data.read_year,
      updatedAt: data.updated_at,
    },
  })
}

export async function PATCH(request: Request) {
  const invalidRequest = validateMutationRequest(request, 10_000)

  if (invalidRequest) return invalidRequest

  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const allowed = await enforceLibraryWriteLimit(request, context.user.id)

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

  const body = await parseBody(request)
  const rawBookIds = body?.bookIds
  const readYear = body?.readYear
  const currentYear = new Date().getUTCFullYear()

  if (
    !Array.isArray(rawBookIds) ||
    rawBookIds.length === 0 ||
    rawBookIds.length > 200 ||
    !rawBookIds.every(
      (bookId): bookId is string =>
        typeof bookId === "string" && UUID_PATTERN.test(bookId)
    ) ||
    !(
      readYear === null ||
      (typeof readYear === "number" &&
        Number.isInteger(readYear) &&
        readYear >= 1900 &&
        readYear <= currentYear)
    )
  ) {
    return NextResponse.json(
      { error: "Año o selección de libros inválidos" },
      { status: 400 }
    )
  }

  const bookIds = [...new Set(rawBookIds)]
  const { data, error } = await context.supabase
    .from("reader_books")
    .update({ read_year: readYear })
    .eq("user_id", context.user.id)
    .eq("is_read", true)
    .in("book_id", bookIds)
    .select("book_id, read_year")

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el año de lectura" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    books: (data ?? []).map((item) => ({
      bookId: item.book_id,
      readYear: item.read_year,
    })),
  })
}

export async function DELETE(request: Request) {
  const invalidRequest = validateMutationRequest(request)

  if (invalidRequest) return invalidRequest

  const context = await getAuthenticatedContext()

  if (!context) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }

  const allowed = await enforceLibraryWriteLimit(request, context.user.id)

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

  const body = await parseBody(request)
  const bookId = body?.bookId

  if (typeof bookId !== "string" || !UUID_PATTERN.test(bookId)) {
    return NextResponse.json(
      { error: "Libro invalido" },
      { status: 400 }
    )
  }

  const { data, error } = await context.supabase
    .from("reader_books")
    .delete()
    .eq("user_id", context.user.id)
    .eq("book_id", bookId)
    .select("book_id")
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "No se pudo quitar el libro" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    removed: Boolean(data),
    bookId,
  })
}
