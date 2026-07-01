import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

import { createSlug } from "@/lib/slug"


export async function POST(req: Request) {

    const { name } = await req.json()

    const slug = createSlug(name)


    const { data } = await supabase
        .from("authors")
        .select("*")
        .eq("slug", slug)
        .single()


    return NextResponse.json({
        exists: !!data,
        author: data || null,
        slug
    })

}