import { createHash, randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import sharp from "sharp"
import {
  BOOK_COVER_CONSENT_TEXT,
  BOOK_COVER_CONSENT_VERSION,
} from "@/lib/bookCoverConsent"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_INPUT_BYTES = 2 * 1024 * 1024
const MAX_OUTPUT_BYTES = 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

async function optimizeCover(bytes: Buffer) {
  const image = sharp(bytes, {
    animated: false,
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: 1200,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })

  for (const quality of [82, 72, 62]) {
    const output = await image.clone().webp({ quality, effort: 4 }).toBuffer()

    if (output.byteLength <= MAX_OUTPUT_BYTES) return output
  }

  const smallerOutput = await image
    .clone()
    .resize({
      width: 1000,
      height: 1500,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 60, effort: 4 })
    .toBuffer()

  return smallerOutput.byteLength <= MAX_OUTPUT_BYTES ? smallerOutput : null
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { error: "Solicitud no autorizada" },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (contentLength > MAX_INPUT_BYTES + 100_000) {
    return NextResponse.json(
      { error: "La portada es demasiado grande" },
      { status: 413 }
    )
  }

  const authClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const allowed = await enforceRateLimit({
      request,
      namespace: "author-book-cover",
      subject: user.id,
      limit: 10,
      windowSeconds: 600,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas portadas. Espera unos minutos." },
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 })
  }

  const bookId = formData.get("bookId")
  const authorId = formData.get("authorId")
  const consentVersion = formData.get("consentVersion")
  const rightsConfirmed = formData.get("rightsConfirmed")
  const cover = formData.get("cover")

  if (
    typeof bookId !== "string" ||
    !UUID_PATTERN.test(bookId) ||
    typeof authorId !== "string" ||
    !UUID_PATTERN.test(authorId) ||
    consentVersion !== BOOK_COVER_CONSENT_VERSION ||
    rightsConfirmed !== "true" ||
    !(cover instanceof File)
  ) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 })
  }

  if (
    cover.size === 0 ||
    cover.size > MAX_INPUT_BYTES ||
    !ALLOWED_TYPES.has(cover.type)
  ) {
    return NextResponse.json(
      { error: "Usa una imagen JPG, PNG o WebP de hasta 2 MB" },
      { status: 400 }
    )
  }

  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("id")
    .eq("author_id", authorId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle()

  if (claimError || !claim) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from("books")
    .select("id, author_id, cover_storage_path")
    .eq("id", bookId)
    .eq("approved", true)
    .maybeSingle()

  if (bookError || !book) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
  }

  let belongsToAuthor = book.author_id === authorId

  if (!belongsToAuthor) {
    const { data: relation, error: relationError } = await supabaseAdmin
      .from("book_authors")
      .select("book_id")
      .eq("book_id", bookId)
      .eq("author_id", authorId)
      .limit(1)
      .maybeSingle()

    if (relationError) {
      return NextResponse.json(
        { error: "No se pudo verificar el libro" },
        { status: 500 }
      )
    }

    belongsToAuthor = Boolean(relation)
  }

  if (!belongsToAuthor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  let optimizedCover: Buffer | null

  try {
    optimizedCover = await optimizeCover(
      Buffer.from(await cover.arrayBuffer())
    )
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la imagen" },
      { status: 400 }
    )
  }

  if (!optimizedCover) {
    return NextResponse.json(
      { error: "No se pudo reducir la portada a un tamano seguro" },
      { status: 422 }
    )
  }

  const storagePath = `${bookId}/${randomUUID()}.webp`
  const { error: uploadError } = await supabaseAdmin.storage
    .from("book-covers")
    .upload(storagePath, optimizedCover, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: "No se pudo guardar la portada" },
      { status: 500 }
    )
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("book-covers")
    .getPublicUrl(storagePath)
  const acceptedAt = new Date().toISOString()
  const imageSha256 = createHash("sha256")
    .update(optimizedCover)
    .digest("hex")

  const { data: consent, error: consentError } = await supabaseAdmin
    .from("book_cover_consents")
    .insert({
      book_id: bookId,
      author_id: authorId,
      user_id: user.id,
      storage_path: storagePath,
      image_sha256: imageSha256,
      consent_version: BOOK_COVER_CONSENT_VERSION,
      consent_text: BOOK_COVER_CONSENT_TEXT,
      accepted_at: acceptedAt,
    })
    .select("id")
    .single()

  if (consentError || !consent) {
    await supabaseAdmin.storage.from("book-covers").remove([storagePath])

    return NextResponse.json(
      { error: "No se pudo registrar la autorizacion" },
      { status: 500 }
    )
  }

  let updateBookQuery = supabaseAdmin
    .from("books")
    .update({
      cover: publicUrlData.publicUrl,
      cover_source: "author_upload",
      cover_storage_path: storagePath,
      cover_rights_confirmed_at: acceptedAt,
      cover_updated_at: acceptedAt,
    })
    .eq("id", bookId)

  updateBookQuery = book.cover_storage_path
    ? updateBookQuery.eq("cover_storage_path", book.cover_storage_path)
    : updateBookQuery.is("cover_storage_path", null)

  const { data: updatedBook, error: updateError } = await updateBookQuery
    .select("id")
    .maybeSingle()

  if (updateError || !updatedBook) {
    await Promise.all([
      supabaseAdmin.storage.from("book-covers").remove([storagePath]),
      supabaseAdmin.from("book_cover_consents").delete().eq("id", consent.id),
    ])

    return NextResponse.json(
      {
        error: updateError
          ? "No se pudo actualizar el libro"
          : "La portada cambio durante la carga. Intenta nuevamente.",
      },
      { status: updateError ? 500 : 409 }
    )
  }

  if (
    typeof book.cover_storage_path === "string" &&
    book.cover_storage_path &&
    book.cover_storage_path !== storagePath
  ) {
    await supabaseAdmin.storage
      .from("book-covers")
      .remove([book.cover_storage_path])
  }

  return NextResponse.json({
    success: true,
    cover: publicUrlData.publicUrl,
    coverSource: "author_upload",
    coverStoragePath: storagePath,
    coverUpdatedAt: acceptedAt,
  })
}
