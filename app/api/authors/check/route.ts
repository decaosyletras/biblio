import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    let body: unknown

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    const name = (body as Record<string, unknown>).name

    if (typeof name !== "string" || !name.trim() || name.length > 300) {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 })
    }

    const normalizedName = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")


    const { data } = await supabase
        .from("authors")
        .select("id, name, slug")
        .eq("normalized_name", normalizedName)
        .limit(1)
        .maybeSingle()


    return NextResponse.json({
        exists: !!data,
        author: data || null,
        slug: data?.slug ?? null
    })

}
