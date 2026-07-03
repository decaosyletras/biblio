"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function MePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getUser()
            const u = data.user

            if (!u) {
                router.replace("/login")
                return
            }

            setUser(u)

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", u.id)
                .single()

            setProfile(profileData)
            setLoading(false)
        }

        load()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                Cargando perfil...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 p-6 rounded-2xl">
                    <h1 className="text-3xl font-bold">Mi cuenta</h1>
                    <p className="text-zinc-400 mt-1">{user.email}</p>
                </div>

                {/* PROFILE CARD */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                    <div>
                        <p className="text-sm text-zinc-400">Username</p>
                        <p className="text-lg font-semibold">
                            {profile?.username || "Sin username"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-zinc-400">Bio</p>
                        <p className="text-zinc-300">
                            {profile?.bio || "Sin bio aún"}
                        </p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push("/me/edit")}
                        className="bg-blue-600 hover:bg-blue-500 transition px-5 py-2 rounded-xl font-semibold"
                    >
                        Editar perfil
                    </button>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push("/login")
                        }}
                        className="bg-red-600 hover:bg-red-500 transition px-5 py-2 rounded-xl font-semibold"
                    >
                        Cerrar sesión
                    </button>
                </div>

            </div>
        </div>
    )
}