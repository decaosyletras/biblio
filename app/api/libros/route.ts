import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const isValidASIN = (value: string) =>
  /^[a-zA-Z0-9]{10}$/.test(value)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const forwarded = req.headers.get("x-forwarded-for")

    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : null

    const {
      titulo,
      autor,
      esAutor,
      registrante,
      esSaga,
      link,
      resumen,
      generos,
      subgeneros,
      asin,
      aceptaTerminos
    } = body

    // Validación básica
    if (
      !titulo ||
      titulo.length > 50 ||
      !autor ||
      !esAutor ||
      !link ||
      !resumen ||
      !generos?.length
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      )
    }

    // Validación ASIN
    if (asin && !isValidASIN(asin)) {
      return NextResponse.json(
        { error: "ASIN inválido (debe tener 10 caracteres alfanuméricos)" },
        { status: 400 }
      )
    }

    // Convertir a boolean
    const es_autor = esAutor === "si"

    // Validación lógica
    if (!es_autor && !registrante) {
      return NextResponse.json(
        { error: "Debes indicar quién registra el libro" },
        { status: 400 }
      )
    }

    if (!aceptaTerminos) {
      return NextResponse.json(
        { error: "Debes aceptar la Política de Privacidad" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("libros").insert([
      {
        titulo,
        autor,
        es_autor,
        es_saga: esSaga,
        registrante: es_autor ? null : registrante,
        link,
        resumen,
        generos,
        subgeneros,
        asin: asin || null,

        acepta_terminos: true,
        fecha_aceptacion: new Date().toISOString(),
        version_politica: "1.1",
        ip_registro: ip
      }
    ])

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    )
  }
}