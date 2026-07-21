import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase-server"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

async function createUniqueSlug(name: string) {
  const base = createSlug(name)

  let slug = base
  let count = 1

  while (true) {
    const { data } = await supabase
      .from("authors")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (!data) {
      return slug
    }

    count++
    slug = `${base}-${count}`
  }
}

async function createUniqueBookSlug(title: string) {
  const base = createSlug(title)

  let slug = base
  let count = 1

  while (true) {
    const { data } = await supabase
      .from("books")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (!data) {
      return slug
    }

    count++
    slug = `${base}-${count}`
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const forwarded = req.headers.get("x-forwarded-for")

    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : null


    const authClient = await createServerClient()

    const {
      data: {
        user
      }
    } = await authClient.auth.getUser()

    // CAMBIO: solo un usuario con sesión activa puede registrar un libro.
    // Esto evita publicaciones anónimas y garantiza que submitted_by procede
    // de una sesión validada, no de datos enviados por el navegador.
    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )
    }


    const {
      titulo,
      autor,
      esSaga,
      link,
      resumen,
      asin,
      generos,
      subgeneros,
      tags,
      useExistingAuthor,
      aceptaTerminos
    } = body

    if (!titulo || !autor) {
      return NextResponse.json(
        {
          error: "Faltan título o autor"
        },
        {
          status: 400
        }
      )
    }

    if (!aceptaTerminos) {
      return NextResponse.json(
        {
          error: "Debes aceptar la Política de Privacidad"
        },
        {
          status: 400
        }
      )
    }

    const normalized = normalizeName(autor)

    const { data: foundAuthor } = await supabase
      .from("authors")
      .select("id,name,slug")
      .eq("normalized_name", normalized)
      .limit(1)
      .maybeSingle()

    let authorId: string

    // Existe el autor y el usuario confirma que es él
    if (foundAuthor && useExistingAuthor) {
      authorId = foundAuthor.id
    }

    // Existe el autor pero el usuario dice que NO es él
    else if (foundAuthor && useExistingAuthor === false) {

      const slug = await createUniqueSlug(autor)

      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert({
          name: autor,
          slug,
          normalized_name: normalized
        })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json(
          {
            error: error.message
          },
          {
            status: 400
          }
        )
      }

      authorId = newAuthor.id
    }


    // No existe ningún autor: crear uno nuevo
    else {
      const slug = await createUniqueSlug(autor)

      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert({
          name: autor,
          slug,
          normalized_name: normalized
        })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json(
          {
            error: error.message
          },
          {
            status: 400
          }
        )
      }

      authorId = newAuthor.id
    }

    const bookSlug = await createUniqueBookSlug(titulo)

    const { error: bookError } = await supabase
      .from("books")
      .insert({
        title: titulo,
        slug: bookSlug,

        asin_es: asin,
        asin_mx: asin,
        asin_us: asin,

        amazon_link: link,

        author_id: authorId,

        is_saga: esSaga,

        summary: resumen,

        genres: generos,

        subgenres: subgeneros,

        review_metrics: tags,

        approved: true,

        accepted_privacy: aceptaTerminos,
        privacy_version: "2.0",
        accepted_at: new Date().toISOString(),
        accepted_ip: ip,
        // user ya se validó arriba; no se admiten publicaciones anónimas.
        submitted_by: user.id
      })

    if (bookError) {
      return NextResponse.json(
        {
          error: bookError.message
        },
        {
          status: 400
        }
      )
    }


    // Ya no se asocia automáticamente el autor al usuario desde esta ruta.
    // El bloque anterior creaba una reclamación con status: "approved" al
    // registrar un libro, permitiendo eludir la revisión de author-claims.
    // Registrar un libro sigue permitido para un autor existente; reclamarlo
    // se realiza exclusivamente en author-claims como solicitud "pending".
    //
    // if (user) {
    //
    //   const { data: existingClaim } = await supabase
    //     .from("author_claims")
    //     .select("id")
    //     .eq("user_id", user.id)
    //     .eq("author_id", authorId)
    //     .maybeSingle()
    //
    //
    //   if (!existingClaim) {
    //
    //     const { error: claimError } = await supabase
    //       .from("author_claims")
    //       .insert({
    //         user_id: user.id,
    //         author_id: authorId,
    //         status: "approved"
    //       })
    //
    //
    //     if (claimError) {
    //
    //       console.error(
    //         "Error creando author claim:",
    //         claimError
    //       )
    //
    //     }
    //
    //   }
    //
    // }


    return NextResponse.json({
      success: true
    })
  } catch (error) {

    return NextResponse.json(
      {
        error: "Error interno"
      },
      {
        status: 500
      }
    )
  }
}
