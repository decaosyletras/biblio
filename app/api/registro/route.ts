import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { nombre, apellido, email } = body

  if (!nombre || !email) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  // 🔍 Verificar si ya existe
  const { data: existing } = await supabase
    .from("registros")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "Este correo ya está registrado. ¡Gracias!" },
      { status: 400 }
    )
  }

  const { error } = await supabase.from("registros").insert([
    { nombre, apellido, email }
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}