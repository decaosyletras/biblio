"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">

      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

        <h1 className="text-2xl font-bold mb-6">
          Recuperar contraseña
        </h1>

        {sent ? (
          <>
            <p className="text-zinc-300">
              Si existe una cuenta con ese correo,
              recibirás un enlace para cambiar tu contraseña.
            </p>

            <Link
              href="/login"
              className="block mt-6 text-blue-400"
            >
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded"
            >
              {loading
                ? "Enviando..."
                : "Enviar enlace"}
            </button>

          </form>
        )}

      </div>

    </div>
  )
}