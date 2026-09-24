import { createHash, randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import sharp from "sharp"
import {
  BOOK_COVER_CONSENT_TEXT,
  BOOK_COVER_CONSENT_VERSION,
} from "@/lib/bookCoverConsent"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { enforceRateLimit } from "@/lib/server-rate-limit"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_COVER_INPUT_BYTES = 2 * 1024 * 1024
const MAX_COVER_OUTPUT_BYTES = 1024 * 1024
const ALLOWED_COVER_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

async function optimizeCover(bytes: Buffer) {
  const image = sharp(bytes, {
    animated: false,
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: 1200,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })

  for (const quality of [82, 72, 62]) {
    const output = await image.clone().webp({ quality, effort: 4 }).toBuffer()
    if (output.byteLength <= MAX_COVER_OUTPUT_BYTES) return output
  }

  const smallerOutput = await image
    .clone()
    .resize({
      width: 1000,
      height: 1500,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 60, effort: 4 })
    .toBuffer()

  return smallerOutput.byteLength <= MAX_COVER_OUTPUT_BYTES
    ? smallerOutput
    : null
}

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

    if (contentLength > MAX_COVER_INPUT_BYTES + 200_000) {
      return NextResponse.json(
        {
          error: "Solicitud demasiado grande"
        },
        {
          status: 413
        }
      )
    }

    let formData: FormData

    try {
      formData = await req.formData()
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

    const rawPayload = formData.get("payload")
    const coverFile = formData.get("cover")

    if (typeof rawPayload !== "string" || !(coverFile instanceof File)) {
      return NextResponse.json(
        { error: "La portada y los datos del libro son obligatorios" },
        { status: 400 }
      )
    }

    if (
      coverFile.size === 0 ||
      coverFile.size > MAX_COVER_INPUT_BYTES ||
      !ALLOWED_COVER_TYPES.has(coverFile.type)
    ) {
      return NextResponse.json(
        { error: "Usa una portada JPG, PNG o WebP de hasta 2 MB" },
        { status: 400 }
      )
    }

    let body: unknown

    try {
      body = JSON.parse(rawPayload)
    } catch {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 }
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
      coverRightsConfirmed,
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

    if (coverRightsConfirmed !== true) {
      return NextResponse.json(
        { error: "Debes confirmar que puedes proporcionar esta portada" },
        { status: 400 }
      )
    }

    let optimizedCover: Buffer | null

    try {
      optimizedCover = await optimizeCover(
        Buffer.from(await coverFile.arrayBuffer())
      )
    } catch {
      return NextResponse.json(
        { error: "No se pudo procesar la portada" },
        { status: 400 }
      )
    }

    if (!optimizedCover) {
      return NextResponse.json(
        { error: "No se pudo reducir la portada a un tamaño seguro" },
        { status: 422 }
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

    const cleanupCreatedOwnership = async () => {
      if (!ownershipCreated) return

      await supabase
        .from("author_claims")
        .delete()
        .eq("user_id", user.id)
        .eq("author_id", authorId)
      await supabase.from("authors").delete().eq("id", authorId)
    }

    const bookSlug = await createUniqueBookSlug(titulo)
    const bookId = randomUUID()
    const storagePath = `${bookId}/${randomUUID()}.webp`
    const acceptedAt = new Date().toISOString()
    const imageSha256 = createHash("sha256")
      .update(optimizedCover)
      .digest("hex")

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(storagePath, optimizedCover, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) {
      await cleanupCreatedOwnership()

      return NextResponse.json(
        { error: "No se pudo guardar la portada" },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(storagePath)

    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert({
        id: bookId,
        title: titulo,
        slug: bookSlug,

        asin_es: normalizedAsin,
        asin_mx: normalizedAsin,
        asin_us: normalizedAsin,

        cover: publicUrlData.publicUrl,
        cover_source: "author_upload",
        cover_storage_path: storagePath,
        cover_rights_confirmed_at: acceptedAt,
        cover_updated_at: acceptedAt,

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
      await supabase.storage.from("book-covers").remove([storagePath])
      await cleanupCreatedOwnership()

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

    const { error: consentError } = await supabase
      .from("book_cover_consents")
      .insert({
        book_id: book.id,
        author_id: authorId,
        user_id: user.id,
        storage_path: storagePath,
        image_sha256: imageSha256,
        consent_version: BOOK_COVER_CONSENT_VERSION,
        consent_text: BOOK_COVER_CONSENT_TEXT,
        accepted_at: acceptedAt,
      })

    if (consentError) {
      await supabase.from("books").delete().eq("id", book.id)
      await supabase.storage.from("book-covers").remove([storagePath])
      await cleanupCreatedOwnership()

      return NextResponse.json(
        { error: "No se pudo registrar la autorización de la portada" },
        { status: 500 }
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
      await supabase.storage.from("book-covers").remove([storagePath])

      const createdAdditionalAuthorIds = additionalAuthorResults
        .filter((result) => result.created)
        .map((result) => result.id)

      if (createdAdditionalAuthorIds.length > 0) {
        await supabase
          .from("authors")
          .delete()
          .in("id", createdAdditionalAuthorIds)
      }

      await cleanupCreatedOwnership()

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
      await supabase.storage.from("book-covers").remove([storagePath])

      const createdAdditionalAuthorIds = additionalAuthorResults
        .filter((result) => result.created)
        .map((result) => result.id)

      if (createdAdditionalAuthorIds.length > 0) {
        await supabase
          .from("authors")
          .delete()
          .in("id", createdAdditionalAuthorIds)
      }

      await cleanupCreatedOwnership()

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
