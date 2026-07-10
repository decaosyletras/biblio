"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function MyClaimsPage() {
    const router = useRouter()
    const [claims, setClaims] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) {
                router.replace("/login")
                return
            }

            const { data } = await supabase
                .from("author_claims")
                .select(`
                    id,
                    status,
                    created_at,
                    authors (
                        name,
                        slug,
                        avatar
                    )
                    `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            setClaims(data || [])
            setLoading(false)
        }

        load()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                Cargando...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">

            <div className="max-w-4xl mx-auto">

                <h1 className="text-3xl font-bold mb-6">
                    Mis solicitudes de autor
                </h1>

                <div className="space-y-4">

                    {claims.length === 0 && (
                        <p className="text-zinc-400">
                            No has reclamado ningún autor aún
                        </p>
                    )}

                    {claims.map((claim) => (
                        <div
                            key={claim.id}
                            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center"
                        >

                            <div>
                                <p className="text-lg font-semibold">
                                    {claim.authors?.name}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    {new Date(claim.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex gap-3 items-center">

                                {claim.status === "pending" && (
                                    <span className="text-yellow-400">
                                        ⏳ Pendiente
                                    </span>
                                )}

                                {claim.status === "approved" && (
                                    <span className="text-green-400">
                                        ✅ Aprobado
                                    </span>
                                )}

                                {claim.status === "rejected" && (
                                    <span className="text-red-400">
                                        ❌ Rechazado
                                    </span>
                                )}

                                <button
                                    onClick={() =>
                                        router.push(`/authors/${claim.authors.slug}`)
                                    }
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
                                >
                                    Ver autor
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}