// Ya no se crea un cliente de servicio directamente sin comprobar quién llama
// a la ruta: eso permitía borrar cualquier cuenta sin autenticación.
// import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
    // CAMBIO: se obtiene el usuario desde la sesión validada por el servidor.
    const authClient = await createClient()
    const {
        data: { user }
    } = await authClient.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: "No autenticado" },
            { status: 401 }
        )
    }

    // CAMBIO: el rol se consulta en el servidor antes de realizar un borrado.
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("admin")
        .eq("id", user.id)
        .maybeSingle()

    if (profileError || !profile?.admin) {
        return NextResponse.json(
            { error: "No autorizado" },
            { status: 403 }
        )
    }

    const { id } = await req.json()

    if (!id || typeof id !== "string") {
        return NextResponse.json(
            { error: "Identificador de usuario inválido" },
            { status: 400 }
        )
    }

    // Sustituido por supabaseAdmin: solo se utiliza tras validar sesión y rol
    // arriba, y permite completar el borrado administrativo sin depender de RLS.
    // const supabase = createClient(
    //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //     process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // delete relations first
    await supabaseAdmin.from("author_claims").delete().eq("user_id", id)
    await supabaseAdmin.from("profiles").delete().eq("id", id)

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) {
        return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
}
