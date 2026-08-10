import { NextResponse } from "next/server"
import { Resend } from "resend"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const resend = new Resend(process.env.RESEND_API_KEY)
const USERS_PER_PAGE = 100

export async function POST(req: Request) {
  try {
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
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

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

    const users: User[] = []
    let page = 1

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: USERS_PER_PAGE,
      })

      if (error) {
        return NextResponse.json(
          { error: "No se pudieron cargar los usuarios" },
          { status: 500 }
        )
      }

      users.push(...data.users)

      if (data.users.length < USERS_PER_PAGE) break
      page++
    }

    const candidates = users.flatMap((candidate) =>
      candidate.email && candidate.email_confirmed_at
        ? [{ id: candidate.id, email: candidate.email }]
        : []
    )
    const candidateIds = candidates.map((candidate) => candidate.id)
    const adminIds = new Set<string>()
    const claimedUserIds = new Set<string>()

    for (let index = 0; index < candidateIds.length; index += USERS_PER_PAGE) {
      const ids = candidateIds.slice(index, index + USERS_PER_PAGE)

      const { data: adminProfiles, error: adminsError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .in("id", ids)
        .eq("admin", true)

      if (adminsError) {
        return NextResponse.json(
          { error: "No se pudieron verificar los administradores" },
          { status: 500 }
        )
      }

      const { data: claims, error: claimsError } = await supabaseAdmin
        .from("author_claims")
        .select("user_id")
        .in("user_id", ids)

      if (claimsError) {
        return NextResponse.json(
          { error: "No se pudieron verificar las reclamaciones" },
          { status: 500 }
        )
      }

      adminProfiles?.forEach((adminProfile) => adminIds.add(adminProfile.id))
      claims?.forEach((claim) => claimedUserIds.add(claim.user_id))
    }

    const recipients = candidates.filter(
      (candidate) =>
        !adminIds.has(candidate.id) && !claimedUserIds.has(candidate.id)
    )

    let enviados = 0
    let errores = 0

    for (const recipient of recipients) {
      const { error } = await resend.emails.send({
        from: "Caza de Libros Indie <notificaciones@cazaindie.com>",
        replyTo: "decaosyletras@gmail.com",
        to: recipient.email,
        subject: "Tu página de autor puede estar esperándote",
        text: `Si tus libros ya aparecen en Caza de Libros Indie, puedes reclamar tu autoría y crear tu página de autor. Busca uno de tus libros y pulsa en «Reclamar autor». Basta con reclamar un solo libro para asociar los demás del mismo autor. Empieza aquí: https://cazaindie.com/libros`,
        html: `
          <p>Hola,</p>
          <p>
            Si tus libros ya aparecen en Caza de Libros Indie, puedes reclamar
            tu autoría y crear tu propia página de autor.
          </p>
          <p>
            Busca uno de tus libros y pulsa en <b>«Reclamar autor»</b>. Basta con
            reclamar un solo libro para asociar los demás del mismo autor.
          </p>
          <p>
            <a href="https://cazaindie.com/libros">Buscar mi libro y reclamar mi autor</a>
          </p>
          <p>Gracias por formar parte de Caza de Libros Indie.</p>
        `,
      })

      if (error) {
        errores++
      } else {
        enviados++
      }
    }

    return NextResponse.json({
      success: true,
      enviados,
      errores,
      omitidos: users.length - recipients.length,
    })
  } catch {
    return NextResponse.json(
      { error: "Error enviando correos" },
      { status: 500 }
    )
  }
}
