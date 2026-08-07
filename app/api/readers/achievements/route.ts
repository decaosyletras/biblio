import { NextResponse } from "next/server"
import { getReaderAchievementSnapshot } from "@/lib/readerAchievements"
import { enforceRateLimit } from "@/lib/server-rate-limit"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { error: "Solicitud no autorizada" },
      { status: 403 }
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
      namespace: "reader-achievements-sync",
      subject: user.id,
      limit: 30,
      windowSeconds: 600,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera unos minutos." },
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar la solicitud" },
      { status: 500 }
    )
  }

  try {
    const snapshot = await getReaderAchievementSnapshot(user.id, { sync: true })

    return NextResponse.json(snapshot)
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los logros" },
      { status: 500 }
    )
  }
}
