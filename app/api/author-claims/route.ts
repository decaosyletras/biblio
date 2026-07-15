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
      author_id,
      aceptaPolitica
    } = body


    // Validación básica

    if (
      !user_id ||
      !author_id
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      )
    }


    if (!aceptaPolitica) {
      return NextResponse.json(
        { error: "Debes aceptar la política de reclamación de autores" },
        { status: 400 }
      )
    }


    // Verificar si ya existe una reclamación aprobada

    const { data: existingClaim } = await supabase
      .from("author_claims")
      .select("id,status")
      .eq("author_id", author_id)
      .eq("status", "approved")
      .maybeSingle()


    if (existingClaim) {
      return NextResponse.json(
        { error: "Este autor ya tiene una cuenta asociada" },
        { status: 400 }
      )
    }


    const { error } = await supabase
      .from("author_claims")
      .insert([
        {
          user_id,
          author_id,
          status: "pending",

          accepted_policy_version: "1.0",
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


  } catch (err) {

    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    )

  }
}