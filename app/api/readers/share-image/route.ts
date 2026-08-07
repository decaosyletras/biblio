import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { getBooks } from "@/lib/books"
import { getBookCover } from "@/lib/amazon"
import { isShareImageTheme } from "@/lib/shareImageThemes"
import { unlockReaderAchievement } from "@/lib/readerAchievements"
import {
  READER_SHARE_IMAGE_SIZES,
  renderReaderShareImage,
  type ReaderShareImageFormat,
} from "@/lib/readerShareImage"

export const dynamic = "force-dynamic"

function isShareFormat(value: string | null): value is ReaderShareImageFormat {
  return value === "story" || value === "post"
}

async function fetchImageDataUrl(url: string) {
  try {
    const response = await fetch(url, { cache: "force-cache" })

    if (!response.ok) return null

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.startsWith("image/")) return null

    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > 5 * 1024 * 1024) return null

    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const formatValue = searchParams.get("format")
  const themeValue = searchParams.get("theme")

  if (
    !isShareFormat(formatValue) ||
    (themeValue !== null && !isShareImageTheme(themeValue))
  ) {
    return NextResponse.json(
      { error: "Formato de imagen inválido" },
      { status: 400 }
    )
  }

  const theme = themeValue ?? "nocturnal"

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
      namespace: "reader-share-image",
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
    { data: readerProfile },
    { data: accountProfile },
    { data: memberships, error: membershipsError },
  ] = await Promise.all([
    supabaseAdmin
      .from("reader_profiles")
      .select("username, display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("reader_books")
      .select("book_id, is_read, added_at")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false }),
  ])

  if (membershipsError) {
    return NextResponse.json(
      { error: "No se pudo cargar la biblioteca" },
      { status: 500 }
    )
  }

  if (!memberships?.length) {
    return NextResponse.json(
      { error: "Agrega al menos un libro antes de crear una imagen" },
      { status: 400 }
    )
  }

  const books = await getBooks()
  const booksById = new Map(books.map((book) => [book.id, book]))
  const visibleBooks = memberships
    .map((membership) => booksById.get(membership.book_id) ?? null)
    .filter((book): book is NonNullable<typeof book> => book !== null)
    .slice(0, 4)

  if (visibleBooks.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron portadas para compartir" },
      { status: 404 }
    )
  }

  const origin = new URL(request.url).origin
  const coverDataUrls = await Promise.all(
    visibleBooks.map((book) => {
      const coverUrl = new URL(
        getBookCover(book.amazon, book.cover),
        origin
      ).toString()

      return fetchImageDataUrl(coverUrl)
    })
  )
  const avatarDataUrl = readerProfile?.avatar_url
    ? await fetchImageDataUrl(readerProfile.avatar_url)
    : null
  const displayName =
    readerProfile?.display_name?.trim() ||
    accountProfile?.username?.trim() ||
    "Lector indie"
  const safeFilename = (
    readerProfile?.username || accountProfile?.username || "lector"
  )
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "lector"
  const size = READER_SHARE_IMAGE_SIZES[formatValue]

  await unlockReaderAchievement(user.id, "library-image")

  return new ImageResponse(
    renderReaderShareImage({
      displayName,
      avatarDataUrl,
      totalBooks: memberships.length,
      readBooks: memberships.filter((membership) => membership.is_read).length,
      books: visibleBooks.map((book, index) => ({
        title: book.title,
        coverDataUrl: coverDataUrls[index],
      })),
      format: formatValue,
      theme,
    }),
    {
      ...size,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="biblioteca-${safeFilename}-${formatValue}.png"`,
        "X-Content-Type-Options": "nosniff",
      },
    }
  )
}
