/*
 * Implementacion anterior conservada como referencia.
 *
 * Se comento completa porque este endpoint permitia consultar datos con el
 * cliente administrativo y enviar correos sin validar sesion ni rol. El flujo
 * seguro ahora vive en /api/admin/author-claims y este archivo solo responde
 * que la ruta anterior fue retirada.
 *
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {

  try {

    const { claimId, status } = await req.json()

    const { data: claim, error } = await supabaseAdmin
      .from("author_claims")
      .select(`
                user_id,
                authors (
                    name
                )
            `)
      .eq("id", claimId)
      .single()

    if (error || !claim) {
      return NextResponse.json(
        { error: "Claim no encontrado" },
        { status: 400 }
      )
    }


    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(
        claim.user_id
      )

    if (userError || !userData.user?.email) {
      return NextResponse.json(
        { error: "Usuario sin email" },
        { status: 400 }
      )
    }


    const authorName = (claim.authors as any)?.name ?? "el autor"


    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      // to: userData.user.email,
      to: "marcos48151@gmail.com",
      subject:
        status === "approved"
          ? "Tu solicitud de autor ha sido aprobada"
          : "Tu solicitud de autor ha sido rechazada",
      html:
        status === "approved"
          ? `
                    <h2>Solicitud aprobada</h2>

                    <p>
                        Tu solicitud para representar a ${authorName} en la Casa de Libros Indie ha sido aprobada.
                    </p>

                    <p>
                        Ya puedes acceder a tu perfil:
                    </p>

                    <a href="https://casaindie.vercel.app/me">
                        Ir a mi cuenta
                    </a>
                    `
          :
          `
                    <h2>Solicitud rechazada</h2>

                    <p>
                        Tu solicitud para representar a ${authorName} ha sido rechazada.
                    </p>

                    <p>
                        Si crees que hubo un error, puedes volver a enviar una solicitud.
                    </p>

                    <a href="https://casaindie.vercel.app/me">
                        Ir a mi cuenta
                    </a>
                    `
    })
    console.log("RESEND RESULT:", emailResult)


    return NextResponse.json({
      success: true
    })


  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Error enviando email" },
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
