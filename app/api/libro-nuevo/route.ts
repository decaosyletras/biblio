import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { enforceRateLimit } from "@/lib/server-rate-limit"


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

function normalizeAsin(value: string) {
  return value.trim().toUpperCase()
}

function isValidAsin(value: string) {
  return /^[A-Z0-9]{10}$/.test(value)
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

type AdditionalAuthorInput = {
  name: string
  useExistingAuthor: boolean
}

async function findOrCreateAdditionalAuthor(
  name: string,
  useExistingAuthor: boolean
) {
  const normalizedName = normalizeName(name)

  const { data: existingAuthor, error: existingAuthorError } = await supabase
    .from("authors")
    .select("id")
    .eq("normalized_name", normalizedName)
    .maybeSingle()

  if (existingAuthorError) {
    throw new Error("No se pudo buscar el autor adicional")
  }

  if (existingAuthor && useExistingAuthor) {
    return {
      id: existingAuthor.id as string,
      created: false
    }
  }

  const slug = await createUniqueSlug(name)

  const { data: newAuthor, error: newAuthorError } = await supabase
    .from("authors")
    .insert({
      name,
      slug,
      normalized_name: normalizedName,
      pro: false,
      pro_until: null
    })
    .select("id")
    .single()

  if (newAuthorError || !newAuthor) {
    throw new Error("No se pudo crear el autor adicional")
  }

  return {
    id: newAuthor.id as string,
    created: true
  }
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin")
    if (origin && origin !== new URL(req.url).origin) {
      return NextResponse.json(
        { error: "Solicitud no autorizada" },
        { status: 403 }
      )
    }

    const contentLength = Number(
      req.headers.get("content-length") ?? 0
    )

    if (contentLength > 100000) {
      return NextResponse.json(
        {
          error: "Solicitud demasiado grande"
        },
        {
          status: 413
        }
      )
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          error: "Solicitud invalida"
        },
        {
          status: 400
        }
      )
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Solicitud invalida"
        },
        {
          status: 400
        }
      )
    }

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

    // El registro pertenece a cuentas identificadas. Las reclamaciones
    // pendientes y aprobadas fijan el autor desde el servidor.
    if (!user) {
      return NextResponse.json(
        { error: "Inicia sesión para registrar uno de tus libros" },
        { status: 401 }
      )
    }

    let ownedAuthorId: string | null = null
    let ownedClaimStatus: "pending" | "approved" | null = null
    const { data: ownedClaim, error: ownedClaimError } = await supabase
      .from("author_claims")
      .select("author_id, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .order("status", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (ownedClaimError) {
      return NextResponse.json(
        { error: "No se pudo verificar el autor asociado a la cuenta" },
        { status: 500 }
      )
    }

    ownedAuthorId = ownedClaim?.author_id ?? null
    ownedClaimStatus =
      ownedClaim?.status === "pending" || ownedClaim?.status === "approved"
        ? ownedClaim.status
        : null

    try {
      const allowed = await enforceRateLimit({
        request: req,
        namespace: "author-book-submission",
        subject: user.id,
        limit: 12,
        windowSeconds: 60 * 60,
      })

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Demasiados envios. Intenta nuevamente mas tarde."
          },
          {
            status: 429
          }
        )
      }
    } catch {
      return NextResponse.json(
        {
          error: "No se pudo validar la solicitud"
        },
        {
          status: 500
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
      aceptaTerminos,
      confirmaAutoria,
      autoresAdicionales
    } = body as Record<string, unknown>

    // Se comento porque solo comprobaba valores truthy y aceptaba tipos
    // inesperados enviados directamente a la API.
    // if (!titulo || !autor) {
    if (
      typeof titulo !== "string" ||
      typeof autor !== "string" ||
      titulo.trim().length === 0 ||
      autor.trim().length === 0 ||
      titulo.length > 300 ||
      autor.length > 300
    ) {
      return NextResponse.json(
        {
          error: "Faltan tÃ­tulo o autor"
        },
        {
          status: 400
        }
      )
    }

    if (typeof asin !== "string") {
      return NextResponse.json(
        {
          error: "El ASIN es obligatorio"
        },
        {
          status: 400
        }
      )
    }

    const normalizedAsin = normalizeAsin(asin)

    if (!isValidAsin(normalizedAsin)) {
      return NextResponse.json(
        {
          error: "El ASIN debe tener 10 caracteres alfanuméricos"
        },
        {
          status: 400
        }
      )
    }

    // Esta comprobación ocurre antes de crear autores para que un intento
    // duplicado no deje registros huérfanos. La migración añade además una
    // protección atómica para solicitudes simultáneas.
    const { data: existingBook, error: existingBookError } = await supabase
      .from("books")
      .select("id")
      .or(
        `asin_es.ilike.${normalizedAsin},asin_mx.ilike.${normalizedAsin},asin_us.ilike.${normalizedAsin}`
      )
      .limit(1)
      .maybeSingle()

    if (existingBookError) {
      return NextResponse.json(
        {
          error: "No se pudo comprobar el ASIN"
        },
        {
          status: 500
        }
      )
    }

    if (existingBook) {
      return NextResponse.json(
        {
          error: "Este ASIN ya está registrado en el catálogo"
        },
        {
          status: 409
        }
      )
    }

    // Se comento porque cualquier valor truthy podia contar como consentimiento.
    // if (!aceptaTerminos) {
    if (aceptaTerminos !== true) {
      return NextResponse.json(
        {
          error: "Debes aceptar la PolÃ­tica de Privacidad"
        },
        {
          status: 400
        }
      )
    }

    if (confirmaAutoria !== true) {
      return NextResponse.json(
        { error: "Debes confirmar que eres autor o coautor de esta obra" },
        { status: 400 }
      )
    }

    const additionalAuthors = autoresAdicionales ?? []

    if (
      !Array.isArray(additionalAuthors) ||
      additionalAuthors.length > 9 ||
      additionalAuthors.some(
        (additionalAuthor) =>
          !additionalAuthor ||
          typeof additionalAuthor !== "object" ||
          Array.isArray(additionalAuthor) ||
          typeof additionalAuthor.name !== "string" ||
          additionalAuthor.name.trim().length === 0 ||
          additionalAuthor.name.length > 300 ||
          typeof additionalAuthor.useExistingAuthor !== "boolean"
      )
    ) {
      return NextResponse.json(
        {
          error: "Los autores adicionales no son validos"
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

    if (foundAuthor && !ownedAuthorId && typeof useExistingAuthor !== "boolean") {
      return NextResponse.json(
        {
          error: "Confirma la coincidencia de autor antes de enviar"
        },
        {
          status: 400
        }
      )
    }

    let authorId: string
    let createdMainAuthor = false
    let ownershipCreated = false

    // CAMBIO: si la cuenta ya tiene un autor aprobado, ese autor manda.
    // El formulario puede seguir enviando cualquier valor, pero ya no decide.
    if (ownedAuthorId) {
      authorId = ownedAuthorId
    }

    // Existe el autor y el usuario confirma que es Ã©l
    else if (foundAuthor && useExistingAuthor) {
      return NextResponse.json(
        {
          error: "Este autor ya existe. Reclámalo primero para registrar libros en su nombre."
        },
        {
          status: 409
        }
      )
    }

    // Existe el autor pero el usuario dice que NO es Ã©l
    else if (foundAuthor && useExistingAuthor === false) {

      const slug = await createUniqueSlug(autor)

      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert({
          name: autor,
          slug,
          normalized_name: normalized,
          // Los autores creados por el formulario publico siempre comienzan
          // sin beneficios de pago. Solo el webhook puede activar PRO.
          pro: false,
          pro_until: null
        })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json(
          {
            // Se comento para no devolver detalles internos de la base de datos.
            // error: error.message
            error: "No se pudo crear el autor"
          },
          {
            status: 400
          }
        )
      }

      authorId = newAuthor.id
      createdMainAuthor = true
    }


    // No existe ningÃºn autor: crear uno nuevo
    else {
      const slug = await createUniqueSlug(autor)

      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert({
          name: autor,
          slug,
          normalized_name: normalized,
          // Los autores creados por el formulario publico siempre comienzan
          // sin beneficios de pago. Solo el webhook puede activar PRO.
          pro: false,
          pro_until: null
        })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json(
          {
            // Se comento para no devolver detalles internos de la base de datos.
            // error: error.message
            error: "No se pudo crear el autor"
          },
          {
            status: 400
          }
        )
      }

      authorId = newAuthor.id
      createdMainAuthor = true
    }

    if (createdMainAuthor) {
      const { error: ownershipError } = await supabase
        .from("author_claims")
        .insert({
          user_id: user.id,
          author_id: authorId,
          status: "approved",
          proof_notes: "Autor creado al registrar su primer libro con una sesión verificada.",
          proof_url: null,
          accepted_policy_version: "1.1",
          accepted_at: new Date().toISOString(),
          accepted_ip: ip
        })

      if (ownershipError) {
        await supabase.from("authors").delete().eq("id", authorId)

        return NextResponse.json(
          { error: "No se pudo asociar el nuevo autor a tu cuenta" },
          { status: 500 }
        )
      }

      ownershipCreated = true
      ownedClaimStatus = "approved"
    }

    const bookSlug = await createUniqueBookSlug(titulo)

    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert({
        title: titulo,
        slug: bookSlug,

        asin_es: normalizedAsin,
        asin_mx: normalizedAsin,
        asin_us: normalizedAsin,

        // La portada de Amazon se conserva durante la transicion hasta que un
        // autor reclamado cargue y autorice una imagen propia.
        cover_source: "amazon",

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
        // La identidad procede de la sesión validada, no del formulario.
        submitted_by: user.id
      })
      .select("id")
      .single()

    if (bookError || !book) {
      if (ownershipCreated) {
        await supabase
          .from("author_claims")
          .delete()
          .eq("user_id", user.id)
          .eq("author_id", authorId)
        await supabase.from("authors").delete().eq("id", authorId)
      }

      const duplicateAsin =
        bookError?.code === "23505" &&
        `${bookError.message ?? ""} ${bookError.details ?? ""}`
          .toLowerCase()
          .includes("asin")

      return NextResponse.json(
        {
          error: duplicateAsin
            ? "Este ASIN ya está registrado en el catálogo"
            : "No se pudo crear el libro"
        },
        {
          status: duplicateAsin ? 409 : 400
        }
      )
    }


    const additionalAuthorInputs = [...new Map(
      (additionalAuthors as AdditionalAuthorInput[]).map((additionalAuthor) => {
        const trimmedName = additionalAuthor.name.trim()
        return [
          normalizeName(trimmedName),
          {
            name: trimmedName,
            useExistingAuthor: additionalAuthor.useExistingAuthor
          }
        ]
      })
    ).values()]

    const additionalAuthorResults: Array<{ id: string; created: boolean }> = []

    try {
      for (const additionalAuthor of additionalAuthorInputs) {
        additionalAuthorResults.push(
          await findOrCreateAdditionalAuthor(
            additionalAuthor.name,
            additionalAuthor.useExistingAuthor
          )
        )
      }
    } catch {
      await supabase.from("books").delete().eq("id", book.id)

      const createdAdditionalAuthorIds = additionalAuthorResults
        .filter((result) => result.created)
        .map((result) => result.id)

      if (createdAdditionalAuthorIds.length > 0) {
        await supabase
          .from("authors")
          .delete()
          .in("id", createdAdditionalAuthorIds)
      }

      if (ownershipCreated) {
        await supabase
          .from("author_claims")
          .delete()
          .eq("user_id", user.id)
          .eq("author_id", authorId)
        await supabase.from("authors").delete().eq("id", authorId)
      }

      return NextResponse.json(
        { error: "No se pudieron guardar todos los autores" },
        { status: 500 }
      )
    }

    const additionalAuthorIds = additionalAuthorResults.map(
      (result) => result.id
    )

    // Se conserva author_id en books como autor principal por compatibilidad
    // con el resto del proyecto. Tambien se registra en book_authors porque
    // el catalogo usa esa tabla como fuente completa cuando hay coautores.
    const relatedAuthorIds = [...new Set([authorId, ...additionalAuthorIds])]

    const { error: bookAuthorsError } = await supabase
      .from("book_authors")
      .insert(
        relatedAuthorIds.map((relatedAuthorId) => ({
          book_id: book.id,
          author_id: relatedAuthorId
        }))
      )

    if (bookAuthorsError) {
      await supabase.from("books").delete().eq("id", book.id)

      const createdAdditionalAuthorIds = additionalAuthorResults
        .filter((result) => result.created)
        .map((result) => result.id)

      if (createdAdditionalAuthorIds.length > 0) {
        await supabase
          .from("authors")
          .delete()
          .in("id", createdAdditionalAuthorIds)
      }

      if (ownershipCreated) {
        await supabase
          .from("author_claims")
          .delete()
          .eq("user_id", user.id)
          .eq("author_id", authorId)
        await supabase.from("authors").delete().eq("id", authorId)
      }

      return NextResponse.json(
        {
          error: "El libro se creo, pero no se pudieron guardar todos sus autores"
        },
        {
          status: 500
        }
      )
    }

    const { data: savedAuthor } = await supabase
      .from("authors")
      .select("id, name, slug")
      .eq("id", authorId)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      bookSlug,
      ownershipCreated,
      author: savedAuthor
        ? {
            ...savedAuthor,
            claimStatus: ownedClaimStatus
          }
        : null
    })
  // Se comento el parametro porque no se utiliza y no debe exponerse.
  // } catch (error) {
  } catch {

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
