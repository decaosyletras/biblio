"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getUser()
            const user = data.user

            if (!user) {
                router.replace("/login")
                return
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("username, bio")
                .eq("id", user.id)
                .single()

            setUsername(profile?.username || "")
            setBio(profile?.bio || "")
            setLoading(false)
        }

        load()
    }, [router])

    const save = async () => {
        setSaving(true)

        const { data } = await supabase.auth.getUser()
        const user = data.user

        if (!user) return

        const { error } = await supabase
            .from("profiles")
            .update({
                username,
                bio
            })
            .eq("id", user.id)

        setSaving(false)

        if (error) {
            alert(error.message)
            return
        }

        router.push("/me")
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                Cargando editor...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
            <div className="max-w-xl mx-auto space-y-6">

                <h1 className="text-3xl font-bold">Editar perfil</h1>

                {/* INPUTS */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">

                    <div>
                        <label className="text-sm text-zinc-400">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full mt-1 bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none"
                            placeholder="Tu username"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full mt-1 bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none min-h-[120px]"
                            placeholder="Cuéntanos sobre ti"
                        />
                    </div>

                </div>

                {/* BUTTONS */}
                <div className="flex gap-3">
                    <button
                        onClick={save}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>

                    <button
                        onClick={() => router.push("/me")}
                        className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-xl"
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    )
}