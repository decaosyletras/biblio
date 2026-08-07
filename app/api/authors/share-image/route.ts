import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { getBookCover } from "@/lib/amazon"
import {
  AUTHOR_SHARE_IMAGE_SIZES,
  renderAuthorShareImage,
  type AuthorShareImageFormat,
  type AuthorShareImageKind,
} from "@/lib/authorShareImage"
import { getBooks } from "@/lib/books"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function isFormat(value: string | null): value is AuthorShareImageFormat {
  return value === "story" || value === "post"
}

function isKind(value: string | null): value is AuthorShareImageKind {
  return value === "profile" || value === "featured" || value === "news"
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value)
    ? value
    : fallback
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
  const authorId = searchParams.get("authorId")
  const format = searchParams.get("format")
  const kind = searchParams.get("kind")

  if (
    !authorId ||
    !UUID_PATTERN.test(authorId) ||
    !isFormat(format) ||
    !isKind(kind)
  ) {
    return NextResponse.json(
      { error: "Autor, plantilla o formato inválido" },
      { status: 400 }
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

  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("id")
    .eq("author_id", authorId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle()

  if (claimError || !claim) {
    return NextResponse.json(
      { error: "No puedes crear imágenes para este autor" },
      { status: 403 }
    )
  }

  try {
    const allowed = await enforceRateLimit({
      request,
      namespace: "author-share-image",
      subject: user.id,
      limit: 15,
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

  const { data: author, error: authorError } = await supabaseAdmin
    .from("authors")
    .select("*")
    .eq("id", authorId)
    .maybeSingle()

  if (authorError || !author) {
    return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 })
  }

  const isPro = author.pro === true
  const rawNews = isPlainObject(author.news) ? author.news : null

  if (kind === "news" && (!isPro || !rawNews)) {
    return NextResponse.json(
      { error: "La plantilla de novedades requiere una novedad PRO" },
      { status: 403 }
    )
  }

  const catalog = await getBooks()
  const authorBooks = catalog.filter((book) =>
    book.authors?.some((bookAuthor) => bookAuthor.id === authorId)
  )
  const featuredBook = authorBooks.find(
    (book) => book.id === author.featured_book_id
  ) ?? null

  if (kind === "featured" && !featuredBook) {
    return NextResponse.json(
      { error: "Selecciona primero un libro destacado" },
      { status: 400 }
    )
  }

  const origin = new URL(request.url).origin
  const imageUrl = (value: unknown) => {
    const url = textValue(value)

    if (!url) return ""

    try {
      return new URL(url, origin).toString()
    } catch {
      return ""
    }
  }
  const prioritizedBooks = featuredBook
    ? [featuredBook, ...authorBooks.filter((book) => book.id !== featuredBook.id)]
    : authorBooks
  const booksForImage = kind === "profile" ? prioritizedBooks.slice(0, 3) : []
  const coverUrls = booksForImage.map((book) =>
    new URL(getBookCover(book.amazon, book.cover), origin).toString()
  )
  const featuredCoverUrl = featuredBook
    ? new URL(
        getBookCover(featuredBook.amazon, featuredBook.cover),
        origin
      ).toString()
    : ""
  const newsImageUrl = rawNews ? imageUrl(rawNews.image) : ""
  const [avatarDataUrl, bannerDataUrl, featuredCoverDataUrl, newsImageDataUrl] =
    await Promise.all([
      imageUrl(author.avatar)
        ? fetchImageDataUrl(imageUrl(author.avatar))
        : Promise.resolve(null),
      isPro && imageUrl(author.banner)
        ? fetchImageDataUrl(imageUrl(author.banner))
        : Promise.resolve(null),
      featuredCoverUrl
        ? fetchImageDataUrl(featuredCoverUrl)
        : Promise.resolve(null),
      newsImageUrl
        ? fetchImageDataUrl(newsImageUrl)
        : Promise.resolve(null),
    ])
  const coverDataUrls = await Promise.all(
    coverUrls.map((url) => fetchImageDataUrl(url))
  )
  const theme = isPlainObject(author.theme) ? author.theme : {}
  const palette = isPro
    ? {
        background: safeColor(theme.bg, "#07152d"),
        surface: safeColor(theme.surface, "#18181b"),
        primary: safeColor(theme.primary, "#60a5fa"),
        text: safeColor(theme.text, "#ffffff"),
        muted: safeColor(theme.muted, "#a1a1aa"),
        border: safeColor(theme.border, "#3f3f46"),
      }
    : {
        background: "#07152d",
        surface: "#18181b",
        primary: "#facc15",
        text: "#ffffff",
        muted: "#a1a1aa",
        border: "#3f3f46",
      }
  const authorName = textValue(author.name) || "Autor independiente"
  const newsTitle = rawNews ? textValue(rawNews.title) : ""
  const safeFilename = (textValue(author.slug) || "autor")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "autor"

  return new ImageResponse(
    renderAuthorShareImage({
      authorName,
      style: textValue(author.style),
      avatarDataUrl,
      bannerDataUrl,
      books: booksForImage.map((book, index) => ({
        title: book.title,
        coverDataUrl: coverDataUrls[index],
      })),
      featuredBook: featuredBook
        ? {
            title: featuredBook.title,
            coverDataUrl: featuredCoverDataUrl,
          }
        : null,
      news: rawNews
        ? {
            type: textValue(rawNews.type) || "Novedad",
            title: newsTitle || `Una novedad de ${authorName}`,
            content: textValue(rawNews.content).slice(0, 300),
            imageDataUrl: newsImageDataUrl,
          }
        : null,
      format,
      kind,
      palette,
    }),
    {
      ...AUTHOR_SHARE_IMAGE_SIZES[format],
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="autor-${safeFilename}-${kind}-${format}.png"`,
        "X-Content-Type-Options": "nosniff",
      },
    }
  )
}
