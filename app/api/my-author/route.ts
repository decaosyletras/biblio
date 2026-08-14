import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {

  const supabase = await createClient()

  const {
    data: {
      user
    }
  } = await supabase.auth.getUser()


  if (!user) {
    return NextResponse.json(
      { error: "No autenticado", author: null },
      { status: 401 }
    )
  }


  const { data, error } = await supabase
    .from("author_claims")
    .select(`
      author_id,
      status,
      authors (
        id,
        name,
        slug
      )
    `)
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"])
    .order("status", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "No se pudo verificar tu autor", author: null },
      { status: 500 }
    )
  }

  if (!data?.authors) {

    return NextResponse.json({
      author: null
    })

  }


  const author = Array.isArray(data.authors)
    ? data.authors[0] ?? null
    : data.authors

  return NextResponse.json({
    author,
    claimStatus: data.status
  })

}
