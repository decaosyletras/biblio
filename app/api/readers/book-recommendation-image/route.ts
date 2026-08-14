import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { getBookCover } from "@/lib/amazon"
import {
  READER_SHARE_IMAGE_SIZES,
  renderBookRecommendationShareImage,
  type ReaderShareImageFormat,
} from "@/lib/bookRecommendationShareImage"
import { getBooks } from "@/lib/books"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { isShareImageTheme } from "@/lib/shareImageThemes"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { unlockReaderAchievement } from "@/lib/readerAchievements"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isShareFormat(value: string | null): value is ReaderShareImageFormat {
  return value === "story" || value === "post"
}

async function fetchImageDataUrl(url: string) {
  try {
    const response = await fetch(url, { cache: "force-cache" })

    if (!response.ok) return null

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.startsWith("image/")) return null

    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.byteLength > 5 * 1024 * 1024) return null

    const normalizedType = contentType.split(";", 1)[0].toLowerCase()

    if (normalizedType !== "image/png" && normalizedType !== "image/jpeg") {
      const png = await sharp(bytes, { animated: false })
        .rotate()
        .resize({
          width: 1800,
          height: 1800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer()

      return `data:image/png;base64,${png.toString("base64")}`
    }

    return `data:${normalizedType};base64,${bytes.toString("base64")}`
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const formatValue = searchParams.get("format")
  const themeValue = searchParams.get("theme")
  const bookId = searchParams.get("bookId")

  if (
    !isShareFormat(formatValue) ||
    (themeValue !== null && !isShareImageTheme(themeValue)) ||
    !bookId ||
    !UUID_PATTERN.test(bookId)
  ) {
    return NextResponse.json(
      { error: "Libro o formato de imagen inválido" },
      { status: 400 }
    )
  }

  const theme = themeValue ?? "emerald"

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
      namespace: "reader-book-recommendation-image",
      subject: user.id,
      limit: 12,
      windowSeconds: 600,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas imágenes. Espera unos minutos." },
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  const [
    { data: membership, error: membershipError },
    { data: readerProfile },
    { data: accountProfile },
  ] = await Promise.all([
    authClient
      .from("reader_books")
      .select("book_id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .eq("is_read", true)
      .maybeSingle(),
    supabaseAdmin
      .from("reader_profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle(),
  ])

  if (membershipError) {
    return NextResponse.json(
      { error: "No se pudo validar la lectura" },
      { status: 500 }
    )
  }

  if (!membership) {
    return NextResponse.json(
      { error: "Marca el libro como leído antes de recomendarlo" },
      { status: 403 }
    )
  }

  const books = await getBooks()
  const book = books.find((candidate) => candidate.id === bookId)

  if (!book) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const coverUrl = new URL(
    getBookCover(book.amazon, book.cover, book.coverSource),
    origin
  ).toString()
  const [coverDataUrl, avatarDataUrl] = await Promise.all([
    fetchImageDataUrl(coverUrl),
    readerProfile?.avatar_url
      ? fetchImageDataUrl(readerProfile.avatar_url)
      : Promise.resolve(null),
  ])
  const displayName =
    readerProfile?.display_name?.trim() ||
    accountProfile?.username?.trim() ||
    "Un lector indie"
  const size = READER_SHARE_IMAGE_SIZES[formatValue]

  await unlockReaderAchievement(user.id, "recommendation-image")

  return new ImageResponse(
    renderBookRecommendationShareImage({
      title: book.title,
      authors: (book.authorNames ?? []).join(", ") || "Autor independiente",
      coverDataUrl,
      displayName,
      avatarDataUrl,
      format: formatValue,
      theme,
    }),
    {
      ...size,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="recomendacion-${book.slug}-${formatValue}.png"`,
        "X-Content-Type-Options": "nosniff",
      },
    }
  )
}
