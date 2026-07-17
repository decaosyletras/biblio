"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type Claim = {
    id: string
    status: string
    created_at: string
    user_id: string
    author_id: string
    proof_url?: string | null
    proof_notes?: string | null
    authors: {
        name: string
        slug: string
    }
    profile?: {
        username: string
        full_name: string | null
    }
}

export default function AdminAuthorClaimsPage() {
    const router = useRouter()

    const [claims, setClaims] = useState<Claim[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)

            // Usuario autenticado
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) {
                router.replace("/login")
                return
            }

            // Comprobar si es admin
            const { data: profile } = await supabase
                .from("profiles")
                .select("admin")
                .eq("id", user.id)
                .single()

            if (!profile?.admin) {
                router.replace("/")
                return
            }

            // Claims
            const { data: claimsData, error } = await supabase
                .from("author_claims")
                .select(`
                        id,
                        status,
                        created_at,
                        user_id,
                        author_id,
                        proof_url,
                        proof_notes,
                        authors (
                        name,
                        slug
                    )
                    `)
                .order("created_at", { ascending: false })

            if (error) {
                setLoading(false)
                return
            }

            // Perfiles
            const userIds = [...new Set(claimsData.map((c: any) => c.user_id))]

            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, username, full_name")
                .in("id", userIds)

            const enriched = claimsData.map((claim: any) => ({
                ...claim,
                profile: profiles?.find((p) => p.id === claim.user_id),
            }))

            setClaims(enriched as Claim[])
            setLoading(false)
        }

        load()
    }, [router])

    const approveClaim = async (claim: Claim) => {
        await supabase
            .from("author_claims")
            .update({
                status: "approved",
            })
            .eq("id", claim.id)

        await fetch("/api/send-claim-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                claimId: claim.id,
                status: "approved",
            }),
        })

        await supabase
            .from("author_claims")
            .update({
                status: "rejected",
            })
            .eq("author_id", claim.author_id)
            .neq("id", claim.id)

        setClaims((prev) =>
            prev.map((c) => {
                if (c.author_id === claim.author_id) {
                    return {
                        ...c,
                        status: c.id === claim.id ? "approved" : "rejected",
                    }
                }

                return c
            })
        )
    }

    const rejectClaim = async (claim: Claim) => {

        await supabase
            .from("author_claims")
            .update({
                status: "rejected",
            })
            .eq("id", claim.id)


        await fetch("/api/send-claim-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                claimId: claim.id,
                status: "rejected",
            }),
        })


        setClaims((prev) =>
            prev.map((c) =>
                c.id === claim.id
                    ? {
                        ...c,
                        status: "rejected",
                    }
                    : c
            )
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                Cargando panel...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-bold mb-8">
                    Panel de solicitudes de autores
                </h1>

                <div className="space-y-4">

                    {claims.length === 0 && (
                        <div className="text-zinc-400">
                            No hay solicitudes.
                        </div>
                    )}

                    {claims.map((claim) => (
                        <div
                            key={claim.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-wrap justify-between gap-6"
                        >
                            <div>
                                <p className="font-semibold text-lg">
                                    {claim.authors?.name}
                                </p>

                                <p className="text-zinc-400">
                                    {claim.profile?.full_name ||
                                        claim.profile?.username ||
                                        claim.user_id}
                                </p>

                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(claim.created_at).toLocaleString("es-ES")}
                                </p>

                                {claim.proof_notes && (
                                    <p className="text-zinc-300 mt-3 text-sm max-w-xl">
                                        📝 {claim.proof_notes}
                                    </p>
                                )}

                                {claim.proof_url && (
                                    <a
                                        href={claim.proof_url}
                                        target="_blank"
                                        className="text-blue-400 hover:underline text-sm"
                                    >
                                        🔗 Ver evidencia
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center gap-3">

                                {claim.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => approveClaim(claim)}
                                            className="rounded-xl bg-green-600 px-4 py-2 hover:bg-green-500"
                                        >
                                            Aprobar
                                        </button>

                                        <button
                                            onClick={() => rejectClaim(claim)}
                                            className="rounded-xl bg-red-600 px-4 py-2 hover:bg-red-500"
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                )}

                                {claim.status === "approved" && (
                                    <span className="text-green-400 font-medium">
                                        ✅ Aprobado
                                    </span>
                                )}

                                {claim.status === "rejected" && (
                                    <span className="text-red-400 font-medium">
                                        ❌ Rechazado
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}