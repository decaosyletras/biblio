import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

export async function PATCH(request: Request) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { error: "Solicitud no autorizada" },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (!Number.isFinite(contentLength) || contentLength > 1000) {
    return NextResponse.json(
      { error: "Solicitud demasiado grande" },
      { status: 413 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  let allowed: boolean

  try {
    allowed = await enforceRateLimit({
      request,
      namespace: "account-username-update",
      subject: user.id,
      limit: 10,
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
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  if (!isPlainObject(body) || typeof body.username !== "string") {
    return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 })
  }

  const username = body.username.trim().toLowerCase()

  if (!USERNAME_PATTERN.test(username) || RESERVED_USERNAMES.has(username)) {
    return NextResponse.json(
      {
        error: "Usa entre 3 y 30 letras, números, puntos, guiones o guiones bajos.",
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabase.rpc("update_my_username", {
    new_username: username,
  })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ese nombre de usuario ya está en uso" },
        { status: 409 }
      )
    }

    if (error.code === "22023") {
      return NextResponse.json(
        { error: "Nombre de usuario inválido" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el nombre de usuario" },
      { status: 500 }
    )
  }

  return NextResponse.json({ username: data })
}
