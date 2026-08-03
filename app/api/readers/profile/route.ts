import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/
const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "authors",
  "login",
  "me",
  "readers",
  "register",
])

type ReaderProfileInput = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  instagramUrl: string
  tiktokUrl: string
  websiteUrl: string
  isPublic: boolean
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function normalizeOptionalUrl(value: unknown) {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.length > 500) return null

  try {
    const url = new URL(trimmed)

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function isReaderAvatarUrl(value: string, userId: string) {
  if (!value) return false
  if (value.length > 2048) return false

  try {
    const url = new URL(value)
    const expectedPath = `/storage/v1/object/public/reader-avatars/${userId}/`

    return (url.protocol === "https:" || url.protocol === "http:") &&
      url.pathname.includes(expectedPath)
  } catch {
    return false
  }
}

function isAllowedAvatar(
  value: string,
  userId: string,
  authorAvatar: string
) {
  return value.length <= 2048 && (
    !value ||
    isReaderAvatarUrl(value, userId) ||
    Boolean(authorAvatar && value === authorAvatar)
  )
}

function parseProfileInput(
  body: unknown,
  userId: string,
  authorAvatar: string
): ReaderProfileInput | null {
  if (!isPlainObject(body)) return null

  const username = typeof body.username === "string"
    ? body.username.trim().toLowerCase()
    : ""
  const displayName = typeof body.displayName === "string"
    ? body.displayName.trim()
    : ""
  const bio = typeof body.bio === "string" ? body.bio.trim() : ""
  const avatarUrl = typeof body.avatarUrl === "string"
    ? body.avatarUrl.trim()
    : ""
  const instagramUrl = normalizeOptionalUrl(body.instagramUrl)
  const tiktokUrl = normalizeOptionalUrl(body.tiktokUrl)
  const websiteUrl = normalizeOptionalUrl(body.websiteUrl)

  if (
    !USERNAME_PATTERN.test(username) ||
    RESERVED_USERNAMES.has(username) ||
    displayName.length < 1 ||
    displayName.length > 60 ||
    bio.length > 240 ||
    !isAllowedAvatar(avatarUrl, userId, authorAvatar) ||
    instagramUrl === null ||
    tiktokUrl === null ||
    websiteUrl === null ||
    typeof body.isPublic !== "boolean"
  ) {
    return null
  }

  return {
    username,
    displayName,
    bio,
    avatarUrl,
    instagramUrl,
    tiktokUrl,
    websiteUrl,
    isPublic: body.isPublic,
  }
}

async function getAuthenticatedUser() {
  const authClient = await createClient()
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser()

  return error ? null : user
}

async function getOwnedAuthorProfile(userId: string) {
  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("author_id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .maybeSingle()

  if (claimError || !claim?.author_id) return null

  const { data: author, error: authorError } = await supabaseAdmin
    .from("authors")
    .select("name, avatar, instagram, tiktok, website")
    .eq("id", claim.author_id)
    .maybeSingle()

  if (authorError || !author) return null

  return {
    name: author.name ?? "",
    avatarUrl: author.avatar ?? "",
    instagramUrl: author.instagram ?? "",
    tiktokUrl: author.tiktok ?? "",
    websiteUrl: author.website ?? "",
  }
}

export async function GET() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }

  const [
    { data: readerProfile, error: readerError },
    { data: accountProfile },
    authorProfile,
  ] =
    await Promise.all([
      supabaseAdmin
        .from("reader_profiles")
        .select(`
          username,
          display_name,
          bio,
          avatar_url,
          instagram_url,
          tiktok_url,
          website_url,
          is_public
        `)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle(),
      getOwnedAuthorProfile(user.id),
    ])

  if (readerError) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    profile: {
      username: readerProfile?.username ?? accountProfile?.username ?? "",
      displayName: readerProfile?.display_name ?? accountProfile?.username ?? "",
      bio: readerProfile?.bio ?? "",
      avatarUrl: readerProfile?.avatar_url ?? "",
      instagramUrl: readerProfile?.instagram_url ?? "",
      tiktokUrl: readerProfile?.tiktok_url ?? "",
      websiteUrl: readerProfile?.website_url ?? "",
      isPublic: readerProfile?.is_public ?? false,
    },
    authorProfile,
  })
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

  if (contentLength > 15000) {
    return NextResponse.json(
      { error: "Solicitud demasiado grande" },
      { status: 413 }
    )
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    )
  }

  let allowed: boolean

  try {
    allowed = await enforceRateLimit({
      request,
      namespace: "reader-profile-update",
      subject: user.id,
      limit: 20,
      windowSeconds: 600,
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 }
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

  const authorProfile = await getOwnedAuthorProfile(user.id)
  const profile = parseProfileInput(
    body,
    user.id,
    authorProfile?.avatarUrl ?? ""
  )

  if (!profile) {
    return NextResponse.json(
      {
        error: "Revisa el nombre de usuario, los limites de texto y las URLs.",
      },
      { status: 400 }
    )
  }

  const [
    { data: readerUsername },
    { data: accountUsername },
    { data: previousReaderProfile },
  ] =
    await Promise.all([
      supabaseAdmin
        .from("reader_profiles")
        .select("user_id")
        .ilike("username", profile.username)
        .neq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", profile.username)
        .neq("id", user.id)
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("reader_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

  if (readerUsername || accountUsername) {
    return NextResponse.json(
      { error: "Ese nombre de usuario ya esta en uso" },
      { status: 409 }
    )
  }

  const { error: accountError } = await supabaseAdmin
    .from("profiles")
    .update({ username: profile.username })
    .eq("id", user.id)

  if (accountError) {
    const conflict = accountError.code === "23505"

    return NextResponse.json(
      {
        error: conflict
          ? "Ese nombre de usuario ya esta en uso"
          : "No se pudo actualizar el perfil",
      },
      { status: conflict ? 409 : 500 }
    )
  }

  const { error: readerError } = await supabaseAdmin
    .from("reader_profiles")
    .upsert({
      user_id: user.id,
      username: profile.username,
      display_name: profile.displayName,
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      instagram_url: profile.instagramUrl,
      tiktok_url: profile.tiktokUrl,
      website_url: profile.websiteUrl,
      is_public: profile.isPublic,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    })

  if (readerError) {
    const conflict = readerError.code === "23505"

    return NextResponse.json(
      {
        error: conflict
          ? "Ese nombre de usuario ya esta en uso"
          : "No se pudo guardar el perfil publico",
      },
      { status: conflict ? 409 : 500 }
    )
  }

  let avatarCleanupWarning = ""
  const hadStoredReaderAvatar = isReaderAvatarUrl(
    previousReaderProfile?.avatar_url ?? "",
    user.id
  )
  const keepsStoredReaderAvatar = isReaderAvatarUrl(
    profile.avatarUrl,
    user.id
  )

  if (hadStoredReaderAvatar && !keepsStoredReaderAvatar) {
    const { error: removeError } = await supabaseAdmin.storage
      .from("reader-avatars")
      .remove([`${user.id}/avatar.webp`])

    if (removeError) {
      avatarCleanupWarning = "El perfil se guardo, pero no se pudo limpiar el avatar anterior."
    }
  }

  return NextResponse.json({
    success: true,
    username: profile.username,
    isPublic: profile.isPublic,
    warning: avatarCleanupWarning,
  })
}
