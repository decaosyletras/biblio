import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const DEFAULT_NEXT_PATH = "/reset-password"

function getSafeNextPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return DEFAULT_NEXT_PATH
  }

  return value
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const type = request.nextUrl.searchParams.get("type")
  const nextPath = getSafeNextPath(
    request.nextUrl.searchParams.get("next")
  )

  // La URL de salida se construye desde el mismo origen y se eliminan todos
  // los parametros para no conservar el token en el historial del navegador.
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = nextPath
  redirectTo.search = ""

  if (tokenHash && type === "recovery") {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery"
    })

    if (!error) {
      const response = NextResponse.redirect(redirectTo)
      response.headers.set("Cache-Control", "no-store")
      return response
    }
  }

  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = "/forgot-password"
  errorUrl.search = ""
  errorUrl.searchParams.set("error", "recovery_link_invalid")

  const response = NextResponse.redirect(errorUrl)
  response.headers.set("Cache-Control", "no-store")
  return response
}
