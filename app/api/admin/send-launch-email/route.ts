import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

    // validar usuario
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

    // validar admin
    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("admin")
        .eq("id", user.id)
        .maybeSingle()

    if (!profile?.admin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // obtener registros
    const { data: registros, error } =
      await supabaseAdmin
        .from("registros")
        .select(`
            id,
            nombre,
            apellido,
            email
        `)
        .not("email", "is", null)
        .is("launch_email_sent_at", null)

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron cargar registros" },
        { status: 500 }
      )
    }

    let enviados = 0
    let errores = 0
    const resend = new Resend(process.env.RESEND_API_KEY)

    for (const registro of registros ?? []) {

      const { error: emailError } =
        await resend.emails.send({
          from: "Caza de Libros Indie <notificaciones@cazaindie.com>",
          replyTo: "decaosyletras@gmail.com",
          to: registro.email,
          subject: "🚀 Una nueva etapa de Caza de Libros Indie ya está aquí",
          html: `
                    <p>Hola ${registro.nombre ?? ""},</p>
                    <p>
                    Hace un tiempo te registraste para ser de las primeras personas
                    en probar la nueva etapa de nuestra plataforma para autores independientes.
                    </p>

                    <p>
                    Queremos agradecerte por confiar en el proyecto desde el inicio.
                    </p>

                    <h2>
                    ¡Una nueva versión ya está aquí! 🚀
                    </h2>

                    <p>
                    Ahora puedes iniciar sesión, reclamar tu perfil de autor
                    y personalizar tu propia página de autor.
                    </p>

                    <p>
                    Además, con la versión PRO podrás crear una página más completa
                    y profesional para compartirla con lectores, editoriales,
                    medios o redes sociales.
                    </p>
                  
                    <p>
                    Como fuiste de las primeras personas en interesarte, queremos recompensar tu confianza:
                    </p>

                    <h3>🎁 Regalo especial</h3>

                    <p>
                    <b>1 mes gratis de descuento en tu acceso PRO</b>
                    </p>

                    <p>
                    Usa el cupón:
                    </p>

                    <h2>
                    AUTORPRO
                    </h2>

                    <p>
                    Disponible únicamente durante las próximas 48 horas.
                    </p>

                    <p>
                    👉 Accede a nuestro nuevo dominio: 
                    <a href="https://cazaindie.com">
                    cazaindie.com
                    </a>
                    </p>

                    <p>
                    Gracias por formar parte de esta etapa inicial. Si tienes cualquier comentario o sugerencia, nos encantará escucharte.
                    </p>

                    <p>
                    ¡GRACIAS POR LA CONFIANZA!
                    </p>

                    <p>
                    @decaosyletras / cas(z)a indie
                    </p>
                    `
        })

      if (emailError) {

        errores++

      } else {

        await supabaseAdmin
          .from("registros")
          .update({
            launch_email_sent_at: new Date().toISOString()
          })
          .eq("id", registro.id)

        enviados++

      }

    }

    return NextResponse.json({
      success: true,
      enviados,
      errores
    })

  } catch {

    return NextResponse.json(
      {
        error: "Error enviando correos"
      },
      {
        status: 500
      }
    )

  }

}
