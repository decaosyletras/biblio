import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const DEFAULT_NEXT_PATH = "/reset-password"
const PRIVACY_VERSION = "1.1"
const TERMS_VERSION = "1.1"

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

function getClientIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip")

  if (realIp) return realIp

  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded
    ? forwarded.split(",")[0].trim()
    : null
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

  /*
   * Flujo anterior conservado como referencia.
   * Se comento porque solo aceptaba recuperacion de contrasena y no registraba
   * el consentimiento despues de confirmar una cuenta.
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
  */

  const verificationType =
    type === "recovery" || type === "email"
      ? type
      : null

  if (tokenHash && verificationType) {
    const supabase = await createClient()
    const {
      data,
      error
    } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: verificationType
    })

    if (!error && data.user) {
      if (verificationType === "email") {
        const acceptedTerms =
          data.user.user_metadata?.accepted_terms === true

        if (!acceptedTerms) {
          const consentErrorUrl = request.nextUrl.clone()
          consentErrorUrl.pathname = "/register"
          consentErrorUrl.search = ""
          consentErrorUrl.searchParams.set(
            "error",
            "consent_required"
          )

          return NextResponse.redirect(consentErrorUrl)
        }

        // La identidad procede del TokenHash verificado. El navegador nunca
        // decide que user_id se guarda en el registro de consentimiento.
        const { error: consentError } = await supabaseAdmin
          .from("user_consents")
          .upsert(
            {
              user_id: data.user.id,
              privacy_version: PRIVACY_VERSION,
              terms_version: TERMS_VERSION,
              accepted_at: new Date().toISOString(),
              accepted_ip: getClientIp(request)
            },
            {
              onConflict: "user_id,privacy_version,terms_version",
              ignoreDuplicates: true
            }
          )

        if (consentError) {
          const consentErrorUrl = request.nextUrl.clone()
          consentErrorUrl.pathname = "/register"
          consentErrorUrl.search = ""
          consentErrorUrl.searchParams.set(
            "error",
            "consent_not_saved"
          )

          return NextResponse.redirect(consentErrorUrl)
        }
      }

      const response = NextResponse.redirect(redirectTo)
      response.headers.set("Cache-Control", "no-store")
      return response
    }
  }

  const errorUrl = request.nextUrl.clone()
  // Antes todos los errores regresaban a forgot-password. Ahora las
  // confirmaciones de cuenta vuelven al registro y recovery conserva su ruta.
  // errorUrl.pathname = "/forgot-password"
  errorUrl.pathname =
    type === "email"
      ? "/register"
      : "/forgot-password"
  errorUrl.search = ""
  errorUrl.searchParams.set(
    "error",
    type === "email"
      ? "confirmation_link_invalid"
      : "recovery_link_invalid"
  )

  const response = NextResponse.redirect(errorUrl)
  response.headers.set("Cache-Control", "no-store")
  return response
}
