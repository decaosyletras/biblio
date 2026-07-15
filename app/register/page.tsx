"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const register = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!aceptaTerminos) {
            alert("Debes aceptar la Política de Privacidad y los Términos de Uso")
            return
        }

        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            alert(error.message)
            return
        }

        const response = await fetch("/api/user-consents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: data.user?.id,
                aceptaTerminos
            })
        })


        const result = await response.json()


        if (!response.ok) {
            alert(result.error)
            return
        }

        router.push(
            `/register/success?email=${encodeURIComponent(email)}`
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

                <h1 className="text-2xl font-bold mb-6">
                    Crear cuenta
                </h1>

                <form
                    onSubmit={register}
                    className="space-y-4"
                >

                    <input
                        className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label className="
                        flex
                        items-start
                        gap-3
                        text-sm
                        text-zinc-300
                    ">

                        <input
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                            className="mt-1"
                        />

                        <span>
                            He leído y acepto la{" "}

                            <Link
                                href="/privacidad"
                                target="_blank"
                                className="text-yellow-400 hover:underline"
                            >
                                Política de Privacidad
                            </Link>

                            {" "}y los{" "}

                            <Link
                                href="/uso"
                                target="_blank"
                                className="text-yellow-400 hover:underline"
                            >
                                Términos de Uso
                            </Link>

                        </span>

                    </label>


                    <button
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-semibold disabled:opacity-50"
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>

                </form>

                <p className="text-sm text-zinc-400 mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        href="/login"
                        className="text-blue-400"
                    >
                        Inicia sesión
                    </Link>
                </p>

            </div>
        </div>
    )
}