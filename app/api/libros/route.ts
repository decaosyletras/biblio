import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()

  const { link, resumen, generos, subgeneros } = body

  if (!link || !resumen || !generos?.length) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    )
  }

  const { error } = await supabase.from("libros").insert([
    {
      link,
      resumen,
      generos,
      subgeneros
    }
  ])

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}