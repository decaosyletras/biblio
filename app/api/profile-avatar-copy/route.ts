import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { enforceRateLimit } from "@/lib/server-rate-limit"

const ALLOWED_BUCKETS = new Set(["authors", "reader-avatars"])
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type AvatarSource = "author" | "reader"

function parseStoredAvatarUrl(urlValue: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !urlValue) return null

  try {
    const url = new URL(urlValue)
    const expectedOrigin = new URL(supabaseUrl).origin
    const prefix = "/storage/v1/object/public/"

    if (url.origin !== expectedOrigin || !url.pathname.startsWith(prefix)) {
      return null
    }

    const parts = url.pathname.slice(prefix.length).split("/")
    const bucket = decodeURIComponent(parts.shift() ?? "")
    const path = parts.map((part) => decodeURIComponent(part)).join("/")

    if (!ALLOWED_BUCKETS.has(bucket) || !path) return null

    return { bucket, path }
  } catch {
    return null
  }
}

async function getOwnedAvatarUrl(userId: string, source: AvatarSource) {
  if (source === "reader") {
    const { data, error } = await supabaseAdmin
      .from("reader_profiles")
      .select("avatar_url")
      .eq("user_id", userId)
      .maybeSingle()

    return error ? "" : data?.avatar_url ?? ""
  }

  const { data: claim, error: claimError } = await supabaseAdmin
    .from("author_claims")
    .select("author_id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .maybeSingle()

  if (claimError || !claim?.author_id) return ""

  const { data: author, error: authorError } = await supabaseAdmin
    .from("authors")
    .select("avatar")
    .eq("id", claim.author_id)
    .maybeSingle()

  return authorError ? "" : author?.avatar ?? ""
}

export async function GET(request: Request) {
  const authClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const sourceParam = new URL(request.url).searchParams.get("source")

  if (sourceParam !== "author" && sourceParam !== "reader") {
    return NextResponse.json({ error: "Origen inválido" }, { status: 400 })
  }

  let allowed: boolean

  try {
    allowed = await enforceRateLimit({
      request,
      namespace: "profile-avatar-copy",
      subject: user.id,
      limit: 30,
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

  const avatarUrl = await getOwnedAvatarUrl(user.id, sourceParam)
  const storedAvatar = parseStoredAvatarUrl(avatarUrl)

  if (!storedAvatar) {
    return NextResponse.json(
      { error: "No hay una foto compatible para importar" },
      { status: 404 }
    )
  }

  const { data: avatar, error: downloadError } = await supabaseAdmin.storage
    .from(storedAvatar.bucket)
    .download(storedAvatar.path)

  if (downloadError || !avatar) {
    return NextResponse.json(
      { error: "No se pudo leer la foto de origen" },
      { status: 500 }
    )
  }

  if (
    avatar.size > MAX_AVATAR_BYTES ||
    !ALLOWED_IMAGE_TYPES.has(avatar.type)
  ) {
    return NextResponse.json(
      { error: "La foto de origen no tiene un formato permitido" },
      { status: 415 }
    )
  }

  return new Response(avatar, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Length": String(avatar.size),
      "Content-Type": avatar.type,
      "X-Content-Type-Options": "nosniff",
    },
  })
}
