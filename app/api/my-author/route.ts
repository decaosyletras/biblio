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
    return NextResponse.json({
      author: null
    })
  }


  const { data } = await supabase
    .from("author_claims")
    .select(`
      author_id,
      authors (
        id,
        name,
        slug
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle()


  if (!data?.authors) {

    return NextResponse.json({
      author: null
    })

  }


  return NextResponse.json({
    author: data.authors
  })

}