import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const resend = new Resend(process.env.RESEND_API_KEY)

const CLAIM_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ClaimStatus = "approved" | "rejected"

type AuthorRelation =
  | {
    name?: string | null
  }
  | Array<{
    name?: string | null
  }>
  | null

function isClaimStatus(value: unknown): value is ClaimStatus {
  return value === "approved" || value === "rejected"
}

export async function POST(req: Request) {
  try {
    // Evita que otro origen intente ejecutar una accion administrativa usando
    // las cookies del navegador. La sesion y el rol se validan igualmente abajo.
    const origin = req.headers.get("origin")
    const requestOrigin = new URL(req.url).origin

    if (origin && origin !== requestOrigin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const authClient = await createClient()
    const {
      data: { user },
      error: authError
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // El cliente administrativo solo se usa despues de validar la identidad.
    // Esta consulta confirma el permiso en servidor y no confia en la interfaz.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile?.admin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
      )
    }

    const {
      claimId,
      status
    } = body as Record<string, unknown>

    if (
      typeof claimId !== "string" ||
      !CLAIM_ID_PATTERN.test(claimId) ||
      !isClaimStatus(status)
    ) {
      return NextResponse.json(
        { error: "Datos invalidos" },
        { status: 400 }
      )
    }

    const { data: claim, error: claimError } = await supabaseAdmin
      .from("author_claims")
      .select(`
        user_id,
        author_id,
        status,
        authors (
          name
        )
      `)
      .eq("id", claimId)
      .maybeSingle()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    const previousStatus = claim.status

    const { data: updatedClaim, error: updateError } = await supabaseAdmin
      .from("author_claims")
      .update({ status })
      .eq("id", claimId)
      .select("status")
      .single()

    if (updateError || !updatedClaim || !isClaimStatus(updatedClaim.status)) {
      return NextResponse.json(
        { error: "No se pudo actualizar la solicitud" },
        { status: 500 }
      )
    }

    // Cuando se aprueba una solicitud, las demas del mismo autor se rechazan.
    // Si esta segunda escritura falla, se intenta restaurar el estado anterior
    // para no dejar varias reclamaciones aprobadas.
    if (updatedClaim.status === "approved") {
      const { error: relatedClaimsError } = await supabaseAdmin
        .from("author_claims")
        .update({ status: "rejected" })
        .eq("author_id", claim.author_id)
        .neq("id", claimId)

      if (relatedClaimsError) {
        await supabaseAdmin
          .from("author_claims")
          .update({ status: previousStatus })
          .eq("id", claimId)

        return NextResponse.json(
          { error: "No se pudo completar la aprobacion" },
          { status: 500 }
        )
      }
    }

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(claim.user_id)

    if (userError || !userData.user?.email) {
      return NextResponse.json({
        success: true,
        status: updatedClaim.status,
        emailSent: false,
        warning: "La decision se guardo, pero no se pudo enviar la notificacion"
      })
    }

    const authors = claim.authors as unknown as AuthorRelation
    const author = Array.isArray(authors) ? authors[0] : authors
    const authorName = author?.name?.trim() || "el autor"
    const approved = updatedClaim.status === "approved"

    const { error: emailError } = await resend.emails.send({
      from: "Casa de Libros Indie <onboarding@resend.dev>",
      to: userData.user.email,
      subject: approved
        ? "Tu solicitud de autor ha sido aprobada"
        : "Tu solicitud de autor ha sido rechazada",
      text: approved
        ? `Tu solicitud para representar a ${authorName} en la Casa de Libros Indie ha sido aprobada. Ya puedes acceder a tu perfil: https://casaindie.vercel.app/me`
        : `Tu solicitud para representar a ${authorName} ha sido rechazada. Si crees que hubo un error, puedes volver a enviar una solicitud: https://casaindie.vercel.app/me`
    })

    if (emailError) {
      return NextResponse.json({
        success: true,
        status: updatedClaim.status,
        emailSent: false,
        warning: "La decision se guardo, pero no se pudo enviar la notificacion"
      })
    }

    return NextResponse.json({
      success: true,
      status: updatedClaim.status,
      emailSent: true
    })
  } catch {
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    )
  }
}
