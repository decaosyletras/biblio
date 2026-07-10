"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function RegisterSuccessPage() {
    const searchParams = useSearchParams()

    const email = searchParams.get("email")

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">

            <div className="max-w-lg w-full rounded-3xl border border-zinc-800 bg-zinc-900 p-10">

                <div className="text-6xl mb-6 text-center">
                    📧
                </div>

                <h1 className="text-3xl font-bold text-center">
                    Revisa tu correo
                </h1>

                <p className="mt-6 text-zinc-300 text-center leading-relaxed">
                    Hemos enviado un correo de confirmación a:
                </p>

                <p className="mt-3 text-center font-semibold text-blue-400 break-all">
                    {email}
                </p>

                <p className="mt-8 text-zinc-400 text-center leading-relaxed">
                    Haz clic en el enlace que encontrarás en ese correo para activar tu cuenta.
                </p>

                <div className="mt-6 rounded-xl bg-zinc-800 p-4 text-sm text-zinc-400">
                    Si no lo encuentras, revisa la carpeta de spam, promociones o correo no deseado.
                </div>

                <div className="mt-8">

                    <Link
                        href="/login"
                        className="block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold hover:bg-blue-500 transition"
                    >
                        Ir al inicio de sesión
                    </Link>

                </div>

            </div>

        </div>
    )
}