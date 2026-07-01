import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

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
      useExistingAuthor
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

    const normalized = normalizeName(autor)

    const { data: foundAuthor } = await supabase
      .from("authors")
      .select("id,name,slug")
      .eq("normalized_name", normalized)
      .maybeSingle()

    let authorId: string

    // Existe el autor y el usuario confirma que es él
    if (foundAuthor && useExistingAuthor) {
      authorId = foundAuthor.id
    }

    // Existe el autor pero el usuario dice que NO es él
    else if (foundAuthor && useExistingAuthor === false) {
      return NextResponse.json(
        {
          error:
            "Ya existe un autor con ese nombre. Si realmente se trata de otra persona con el mismo nombre, ponte en contacto con nosotros para que podamos diferenciar ambos perfiles."
        },
        {
          status: 400
        }
      )
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

        approved: true
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

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error(error)

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