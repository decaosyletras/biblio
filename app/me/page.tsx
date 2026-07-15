"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useProfile } from "@/hooks/useProfile"

type OwnedAuthor = {
    id: string
    name: string
    slug: string
    avatar: string
    pro: boolean
}

type UserRow = {
    id: string
    username: string
}

export default function MePage() {
    const router = useRouter()
    const { user, profile, loading } = useProfile()

    const [author, setAuthor] = useState<OwnedAuthor | null>(null)
    const [loadingAuthor, setLoadingAuthor] = useState(true)

    const [claims, setClaims] = useState<any[]>([])
    const [loadingClaims, setLoadingClaims] = useState(true)

    const [users, setUsers] = useState<UserRow[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)


    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login")
        }
    }, [loading, user, router])


    // LOAD AUTHOR
    useEffect(() => {
        if (!user) return

        const loadAuthor = async () => {
            setLoadingAuthor(true)

            const { data, error } = await supabase
                .from("author_claims")
                .select(`
                    status,
                    authors (
                        id,
                        name,
                        slug,
                        avatar,
                        pro
                    )
                `)
                .eq("user_id", user.id)
                .eq("status", "approved")
                .maybeSingle()

            if (error) {
                setAuthor(null)
                setLoadingAuthor(false)
                return
            }

            const authorData = data?.authors

            if (!authorData) {
                setAuthor(null)
                setLoadingAuthor(false)
                return
            }
            const author = Array.isArray(authorData)
                ? authorData[0]
                : authorData


            setAuthor({
                id: author.id,
                name: author.name,
                slug: author.slug,
                avatar: author.avatar,
                pro: author.pro ?? false,
            })
            setLoadingAuthor(false)
        }

        loadAuthor()

    }, [user])

    // LOAD CLAIMS
    useEffect(() => {
        if (!user) return
        const loadClaims = async () => {
            setLoadingClaims(true)
            const { data, error } = await supabase
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
                .order("created_at", {
                    ascending: false
                })
            if (error) {
                setClaims([])
            } else {
                setClaims(data || [])
            }
            setLoadingClaims(false)
        }
        loadClaims()
    }, [user])

    // ADMIN CHECK
    const isAdmin = profile?.admin === true

    // LOAD USERS ADMIN
    const loadUsers = async () => {
        setLoadingUsers(true)
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username")

        if (!error && data) {
            setUsers(data)
        }

        setLoadingUsers(false)
    }

    // DELETE USER
    const deleteUser = async (id: string) => {

        const confirmDelete = window.confirm(
            "⚠️ Esto borrará el usuario completamente. ¿Continuar?"
        )
        if (!confirmDelete) return
        const res = await fetch("/api/admin/delete-user", {
            method: "POST",
            body: JSON.stringify({ id }),
        })
        const json = await res.json()
        if (json.error) {
            alert(json.error)
            return
        }
        setUsers(prev =>
            prev.filter(u => u.id !== id)
        )
        alert("Usuario eliminado")
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                Cargando perfil...
            </div>
        )
    }

    const hasPendingClaim = claims.some(
        claim => claim.status === "pending"
    )

    const showAuthorCTA =
        !loadingClaims &&
        !author &&
        !hasPendingClaim

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">


                {/* HEADER */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Mi cuenta
                    </h1>
                </div>

                {/* PERFIL */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                        <div>
                            <p className="text-sm uppercase tracking-wider text-zinc-500 mb-0">
                                Usuario:
                            </p>

                            <p className="text-2xl font-bold text-white">
                                {profile?.username}
                            </p>

                            <p className="text-zinc-400 mt-2 break-all">
                                {user.email}
                            </p>
                        </div>


                        <button
                            onClick={() => router.push("/me/edit")}
                            className="
                                w-full sm:w-auto
                                px-5 py-3
                                rounded-xl
                                bg-stone-100
                                text-stone-900
                                hover:bg-stone-200
                                active:scale-95
                                active:bg-stone-300
                                transition-all
                                duration-150
                                "
                        >
                            Editar nombre
                        </button>

                    </div>

                </div>

                {/* MIS SOLICITUDES / AUTOR */}

                <div
                    id="mis-solicitudes"
                    className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
                >
                    <h2 className="text-xl font-bold mb-5">
                        Mi estado de autor
                    </h2>

                    {loadingClaims && (
                        <p className="text-zinc-400">
                            Cargando...
                        </p>
                    )}

                    {!loadingClaims && claims.length === 0 && (
                        <div className="space-y-5">

                            <p className="text-zinc-400">
                                Todavía no has reclamado ningún autor. Si ya has registrado tus libros
                                en la Casa de Libros Indie, búscalos en el catálogo y reclama tu perfil
                                para empezar a gestionar tu página de autor.
                            </p>

                            <Link
                                href="/libros"
                                className="
                                    inline-flex
                                    items-center
                                    px-5
                                    py-3
                                    rounded-xl
                                    bg-blue-600
                                    hover:bg-blue-500
                                    transition
                                    font-medium
                                "
                            >
                                Buscar en el catálogo →
                            </Link>

                            <div className="border-t border-zinc-800 pt-5">
                                <p className="text-zinc-400">
                                    ¿Aún no tienes ningún libro registrado en la Casa de Libros Indie?
                                </p>

                                <Link
                                    href="/contact"
                                    className="
                                        inline-flex
                                        mt-3
                                        px-5
                                        py-3
                                        rounded-xl
                                        bg-yellow-500
                                        text-black
                                        font-medium
                                        hover:bg-yellow-400
                                        transition
                                    "
                                >
                                    Registrar mi libro
                                </Link>
                            </div>

                        </div>
                    )}

                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <div
                                key={claim.id}
                                className="
                                    p-5 rounded-2xl border
                                    flex flex-col sm:flex-row
                                    gap-5
                                    sm:items-center
                                    sm:justify-between
                                    "
                            >
                                <div className="flex items-start gap-4">

                                    {claim.authors?.avatar && (

                                        <img
                                            src={claim.authors.avatar}
                                            alt={claim.authors.name}
                                            className="w-14 h-14 rounded-xl object-cover border border-zinc-700"
                                        />
                                    )}

                                    <div>
                                        <p className="text-lg font-semibold">
                                            {claim.authors?.name}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            Solicitud enviada el{" "}
                                            {new Date(
                                                claim.created_at
                                            ).toLocaleDateString()}
                                        </p>

                                        {claim.status === "pending" && (
                                            <p className="text-yellow-400 mt-1">
                                                ⏳ Solicitud pendiente de revisión
                                            </p>
                                        )}

                                        {claim.status === "rejected" && (
                                            <p className="text-red-400 mt-1">
                                                ❌ Solicitud rechazada
                                            </p>
                                        )}

                                        {claim.status === "approved" && (
                                            <p className="text-green-400 mt-1">
                                                ✅ Autor verificado
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {claim.status === "approved" && (

                                    <Link
                                        href={`/authors/${claim.authors.slug}`}
                                        className="
                                            w-full sm:w-auto
                                            text-center
                                            px-5 py-3
                                            rounded-xl
                                            bg-green-600
                                            hover:bg-green-500
                                            active:bg-green-700
                                            active:scale-95
                                            font-semibold
                                            transition-all
                                            duration-150
                                            shadow-lg shadow-green-900/30
                                            "
                                    >
                                        Ver página de autor →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                </div>


                {/* AUTOR */}
                {/*!loadingAuthor && author && (

                    <Link
                        href={`/authors/${author.slug}`}
                        className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-blue-500 transition"
                    >
                        <div className="flex items-center gap-4">

                            <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-16 h-16 rounded-xl object-cover border border-zinc-700"
                            />

                            <div>
                                <p className="text-xl font-bold">
                                    {author.name}
                                </p>

                                <p className="text-zinc-400">
                                    Ver página de autor →
                                </p>
                            </div>
                        </div>
                    </Link>

                )*/}

                {/* ACTIONS */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/*<button
                            onClick={() =>
                                document
                                    .getElementById("mis-solicitudes")
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                            }
                            className="px-5 py-3 rounded-xl bg-zinc-800"
                        >
                            Mis solicitudes
                        </button>*/}

                        <button
                            onClick={async () => {

                                await supabase.auth.signOut()

                                router.refresh()
                                router.push("/login")

                            }}
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600"
                        >
                            Cerrar sesión
                        </button>

                        {profile?.admin && (

                            <button
                                onClick={() =>
                                    router.push("/admin/author-claims")
                                }
                                className="px-5 py-3 rounded-xl bg-green-600"
                            >
                                Panel admin
                            </button>
                        )}
                    </div>
                </div>

                {/* ADMIN USERS */}
                {isAdmin && (
                    <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-red-400">
                            Admin - Usuarios
                        </h2>
                        <button
                            onClick={loadUsers}
                            className="mt-3 px-4 py-2 bg-red-600 rounded-xl"
                        >
                            Cargar usuarios
                        </button>
                        {loadingUsers && (

                            <p className="text-zinc-400 mt-2">
                                Cargando...
                            </p>
                        )}

                        <div className="mt-4 space-y-2">
                            {users.map((u) => (

                                <div
                                    key={u.id}
                                    className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-zinc-900 p-3 rounded-xl"
                                >
                                    <div>
                                        <p className="text-sm">
                                            {u.username}
                                        </p>


                                        <p className="text-xs text-zinc-500">
                                            {u.id}
                                        </p>

                                    </div>
                                    <button
                                        onClick={() =>
                                            deleteUser(u.id)
                                        }
                                        className="w-full sm:w-auto px-3 py-2 bg-red-600 rounded-lg"
                                    >
                                        Borrar
                                    </button>

                                </div>
                            ))}

                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}