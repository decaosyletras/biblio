// Ya no se crea un cliente de servicio directamente en esta ruta: no valida
// la sesión del solicitante. createClient de supabase-server la valida con cookies.
// import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// Sustituido por supabaseAdmin para las consultas/escrituras administrativas
// y por authClient dentro de POST para obtener el usuario autenticado.
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )


export async function POST(req: Request) {
  try {

    // CAMBIO: la identidad se obtiene de la sesión validada en el servidor,
    // no de datos controlados por el navegador.
    const authClient = await createClient()
    const {
      data: { user }
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Una cuenta solo puede gestionar un perfil de autor. Esta validacion en
    // servidor evita eludir el bloqueo de la interfaz con peticiones directas.
    const { data: activeClaim, error: activeClaimError } = await supabaseAdmin
      .from("author_claims")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .limit(1)
      .maybeSingle()

    if (activeClaimError) {
      return NextResponse.json(
        { error: "No se pudo verificar tu reclamacion actual" },
        { status: 500 }
      )
    }

    if (activeClaim) {
      return NextResponse.json(
        {
          error: "Tu cuenta ya tiene una reclamacion pendiente o aprobada"
        },
        { status: 409 }
      )
    }

    const body = await req.json()

    const forwarded = req.headers.get("x-forwarded-for")

    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : null


    const {
      // user_id ya no se acepta: podía ser manipulado para suplantar cuentas.
      // Lo sustituye user.id, obtenido de la sesión validada arriba.
      // user_id,
      author_id,
      aceptaPolitica,
      proof_notes,
      proof_url
    } = body


    // Validación básica

    if (
      // !user_id ya no aplica: user.id existe después de la comprobación de sesión.
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

    if (!proof_notes?.trim() || !proof_url?.trim()) {
      return NextResponse.json(
        { error: "Debes aportar una explicación y un enlace de verificación" },
        { status: 400 }
      )
    }


    // Verificar si ya existe una reclamación aprobada

    const { data: existingClaim } = await supabaseAdmin
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


    const { error } = await supabaseAdmin
      .from("author_claims")
      .insert([
        {
          // user_id del body ya no se usa porque permitía suplantación.
          // Lo sustituye la identidad de la sesión validada en el servidor.
          user_id: user.id,
          author_id,
          // CAMBIO: una solicitud nueva debe revisarse por un administrador.
          // status: "approved",
          status: "pending",

          proof_notes: proof_notes || null,
          proof_url: proof_url || null,

          accepted_policy_version: "1.1",
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
