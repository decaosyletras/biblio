"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Callback() {
    const router = useRouter()
    const [callbackError, setCallbackError] = useState("")

    useEffect(() => {
        let active = true

        const run = async () => {
            // Implementacion anterior conservada como referencia.
            // Se comento porque ignoraba el error y redirigia incluso cuando no
            // existia una sesion valida.
            // await supabase.auth.getSession()
            // router.push("/")
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()

            if (error || !session) {
                if (active) {
                    setCallbackError(
                        "No se pudo completar el inicio de sesión. Inténtalo nuevamente."
                    )
                }
                return
            }

            router.replace("/")
            router.refresh()
        }

        run()

        return () => {
            active = false
        }
    }, [router])

    // Se comento porque siempre mostraba un estado de carga, incluso cuando el
    // callback habia fallado.
    // return <p>Entrando...</p>
    if (callbackError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <p role="alert" className="text-red-400">
                        {callbackError}
                    </p>
                    <Link
                        href="/login"
                        className="mt-5 inline-block text-blue-400 hover:underline"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        )
    }

    return <p>Entrando...</p>
}
