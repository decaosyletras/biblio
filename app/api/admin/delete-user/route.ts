import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    const { id } = await req.json()

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // delete relations first
    await supabase.from("author_claims").delete().eq("user_id", id)
    await supabase.from("profiles").delete().eq("id", id)

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
        return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
}