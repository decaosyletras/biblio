/*
 * Implementacion anterior conservada como referencia.
 *
 * Se comento completa porque aceptaba user_id desde el navegador y permitia
 * atribuir consentimientos sin verificar la identidad. El consentimiento ahora
 * se registra en /auth/confirm despues de verificar TokenHash.
 *
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(req: Request) {

  try {

    const body = await req.json()

    const forwarded = req.headers.get("x-forwarded-for")

    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : null


    const {
      user_id,
      aceptaTerminos
    } = body


    if (!user_id) {
      return NextResponse.json(
        { error: "Usuario requerido" },
        { status: 400 }
      )
    }


    if (!aceptaTerminos) {
      return NextResponse.json(
        { error: "Debes aceptar los términos" },
        { status: 400 }
      )
    }


    const { error } = await supabase
      .from("user_consents")
      .insert([
        {
          user_id,

          privacy_version: "1.1",
          terms_version: "1.1",

          accepted_at: new Date().toISOString(),

          accepted_ip: ip
        }
      ])


    if (error) {

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )

    }


    return NextResponse.json({
      success: true
    })


  } catch {

    return NextResponse.json(
      { error: "Error procesando solicitud" },
      { status: 500 }
    )

  }

}
*/

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Este endpoint fue retirado"
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  )
}
