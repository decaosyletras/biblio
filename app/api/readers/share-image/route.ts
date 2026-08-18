import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { getBooks } from "@/lib/books"
import { getBookCover } from "@/lib/amazon"
import { isShareImageTheme } from "@/lib/shareImageThemes"
import { unlockReaderAchievement } from "@/lib/readerAchievements"
import { getReaderOwnedBookContext } from "@/lib/readerOwnedBooks"
import {
  READER_SHARE_IMAGE_SIZES,
  renderReaderShareImage,
  type ReaderShareImageFormat,
} from "@/lib/readerShareImage"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    ownedContextResult,
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
    getReaderOwnedBookContext(user.id).catch(() => null),
  ])

  if (membershipsError || !ownedContextResult) {
    return NextResponse.json(
      { error: "No se pudo cargar la biblioteca" },
      { status: 500 }
    )
  }

  const visibleMemberships = (memberships ?? []).filter(
    (membership) => !ownedContextResult.bookIds.has(membership.book_id)
  )

  if (visibleMemberships.length === 0) {
    return NextResponse.json(
      { error: "Agrega al menos un libro antes de crear una imagen" },
      { status: 400 }
    )
  }

  const books = await getBooks()
  const booksById = new Map(books.map((book) => [book.id, book]))
  const visibleBooks = visibleMemberships
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
        getBookCover(book.amazon, book.cover, book.coverSource),
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
      totalBooks: visibleMemberships.length,
      readBooks: visibleMemberships.filter((membership) => membership.is_read).length,
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
