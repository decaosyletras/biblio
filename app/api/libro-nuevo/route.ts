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

    // CAMBIO: este endpoint vuelve a permitir registro anónimo porque el flujo
    // del proyecto lo necesita. La restricción real ahora es otra: si existe
    // sesión y ya hay una reclamación aprobada, el autor se fija en servidor y
    // no se puede eludir desde el formulario.
    //
    // if (!user) {
    //   return NextResponse.json(
    //     {
    //       error: "No autenticado"
    //     },
    //     {
    //       status: 401
    //     }
    //   )
    // }

    // CAMBIO: si hay sesión, buscamos si ese perfil ya tiene un autor aprobado.
    // Eso sustituye la confianza en el formulario y evita que un usuario con
    // autor activo registre un libro para otro autor distinto.
    let ownedAuthorId: string | null = null
    if (user) {
      const { data: ownedClaim, error: ownedClaimError } = await supabase
        .from("author_claims")
        .select("author_id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle()

      if (ownedClaimError) {
        return NextResponse.json(
          {
            error: "No se pudo verificar el autor asociado a la cuenta"
          },
          {
            status: 500
          }
        )
      }

      ownedAuthorId = ownedClaim?.author_id ?? null
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
          error: "Faltan tÃ­tulo o autor"
        },
        {
          status: 400
        }
      )
    }

    if (!aceptaTerminos) {
      return NextResponse.json(
        {
          error: "Debes aceptar la PolÃ­tica de Privacidad"
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

    // CAMBIO: si la cuenta ya tiene un autor aprobado, ese autor manda.
    // El formulario puede seguir enviando cualquier valor, pero ya no decide.
    if (ownedAuthorId) {
      authorId = ownedAuthorId
    }

    // Existe el autor y el usuario confirma que es Ã©l
    else if (foundAuthor && useExistingAuthor) {
      authorId = foundAuthor.id
    }

    // Existe el autor pero el usuario dice que NO es Ã©l
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


    // No existe ningÃºn autor: crear uno nuevo
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
        // CAMBIO: si no hay sesión, submitted_by queda nulo. Si la hay, se
        // guarda el id real sin asumir que el formulario lo definió.
        submitted_by: user?.id ?? null
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


    // Ya no se asocia automÃ¡ticamente el autor al usuario desde esta ruta.
    // El bloque anterior creaba una reclamaciÃ³n con status: "approved" al
    // registrar un libro, permitiendo eludir la revisiÃ³n de author-claims.
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