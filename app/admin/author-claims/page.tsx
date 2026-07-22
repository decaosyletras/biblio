"use client"

import { useEffect, useState } from "react"
// Se comento porque el panel ya no consulta Supabase directamente desde el
// navegador. La sesion, el rol y los datos sensibles se validan en el servidor.
// import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type ClaimAuthor = {
    name: string
    slug: string
}

type Claim = {
    id: string
    status: string
    created_at: string
    user_id: string
    author_id: string
    proof_url?: string | null
    proof_notes?: string | null
    /*
     * Se comento porque Supabase puede devolver esta relacion como arreglo.
    authors: {
        name: string
        slug: string
    }
    */
    authors: ClaimAuthor | ClaimAuthor[]
    profile?: {
        username: string
        full_name: string | null
    }
}

type ClaimDecision = "approved" | "rejected"

function getClaimAuthor(claim: Claim) {
    return Array.isArray(claim.authors)
        ? claim.authors[0]
        : claim.authors
}

export default function AdminAuthorClaimsPage() {
    const router = useRouter()

    const [claims, setClaims] = useState<Claim[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null)
    const [actionError, setActionError] = useState("")

    /*
     * Implementacion anterior conservada como referencia.
     * Se comento porque confiaba al navegador la lectura del rol, las
     * reclamaciones, las evidencias y los perfiles de otros usuarios.
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
            const safeClaims = (claimsData ?? []) as Claim[]

            // Se comento porque any impedia validar el panel con ESLint.
            // const userIds = [...new Set(claimsData.map((c: any) => c.user_id))]
            const userIds = [...new Set(safeClaims.map((claim) => claim.user_id))]

            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, username, full_name")
                .in("id", userIds)

            // Se comento por la misma razon: safeClaims ya aporta el tipo Claim.
            // const enriched = claimsData.map((claim: any) => ({
            const enriched = safeClaims.map((claim) => ({
                ...claim,
                profile: profiles?.find((p) => p.id === claim.user_id),
            }))

            setClaims(enriched as Claim[])
            setLoading(false)
        }

        load()
    }, [router])
    */

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setActionError("")

            try {
                const response = await fetch("/api/admin/author-claims", {
                    method: "GET",
                    cache: "no-store",
                })

                const result = await response
                    .json()
                    .catch(() => null) as {
                        claims?: Claim[]
                        error?: string
                    } | null

                if (response.status === 401) {
                    setLoading(false)
                    router.replace("/login")
                    return
                }

                if (response.status === 403) {
                    setLoading(false)
                    router.replace("/")
                    return
                }

                if (!response.ok) {
                    throw new Error(
                        result?.error ?? "No se pudieron cargar las solicitudes"
                    )
                }

                setClaims(result?.claims ?? [])
            } catch (error) {
                setClaims([])
                setActionError(
                    error instanceof Error
                        ? error.message
                        : "No se pudieron cargar las solicitudes"
                )
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [router])

    /*
     * Implementacion anterior conservada como referencia.
     * Se comento porque modificaba reclamaciones y disparaba el correo
     * directamente desde el navegador, sin una autorizacion de servidor.
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
    */

    const updateClaimStatus = async (
        claim: Claim,
        status: ClaimDecision
    ) => {
        setUpdatingClaimId(claim.id)
        setActionError("")

        try {
            const response = await fetch("/api/admin/author-claims", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    claimId: claim.id,
                    status,
                }),
            })

            const result = await response
                .json()
                .catch(() => null) as {
                    error?: string
                    warning?: string
                    emailSent?: boolean
                } | null

            if (!response.ok) {
                throw new Error(
                    result?.error ?? "No se pudo actualizar la solicitud"
                )
            }

            setClaims((prev) =>
                prev.map((currentClaim) => {
                    if (
                        status === "approved" &&
                        currentClaim.author_id === claim.author_id
                    ) {
                        return {
                            ...currentClaim,
                            status:
                                currentClaim.id === claim.id
                                    ? "approved"
                                    : "rejected",
                        }
                    }

                    if (currentClaim.id === claim.id) {
                        return {
                            ...currentClaim,
                            status,
                        }
                    }

                    return currentClaim
                })
            )

            if (result?.emailSent === false) {
                setActionError(
                    result.warning ??
                    "La decision se guardo, pero no se pudo enviar la notificacion."
                )
            }
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la solicitud"
            )
        } finally {
            setUpdatingClaimId(null)
        }
    }

    const approveClaim = async (claim: Claim) => {
        await updateClaimStatus(claim, "approved")
    }

    const rejectClaim = async (claim: Claim) => {
        await updateClaimStatus(claim, "rejected")
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

                {actionError && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300"
                    >
                        {actionError}
                    </div>
                )}

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
                                    {/* Se comento porque la relacion tambien puede
                                        llegar como arreglo desde Supabase. */}
                                    {/* {claim.authors?.name} */}
                                    {getClaimAuthor(claim)?.name}
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
                                            disabled={updatingClaimId !== null}
                                            className="rounded-xl bg-green-600 px-4 py-2 hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {updatingClaimId === claim.id
                                                ? "Guardando..."
                                                : "Aprobar"}
                                        </button>

                                        <button
                                            onClick={() => rejectClaim(claim)}
                                            disabled={updatingClaimId !== null}
                                            className="rounded-xl bg-red-600 px-4 py-2 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {updatingClaimId === claim.id
                                                ? "Guardando..."
                                                : "Rechazar"}
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
