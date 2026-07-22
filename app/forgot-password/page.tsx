"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setErrorMsg("")

    const normalizedEmail = email.trim().toLowerCase()

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      // Se comento porque el flujo anterior llevaba directamente al formulario
      // y dependia de que el navegador recibiera una sesion implicita.
      // redirectTo: `${window.location.origin}/reset-password`
      //
      // La plantilla de recuperacion usa este origen para construir el enlace
      // hacia /auth/confirm con TokenHash y type=recovery.
      redirectTo: window.location.origin
    })

    setLoading(false)

    if (error) {
      // Se comento para no exponer mensajes internos del proveedor.
      // alert(error.message)
      setErrorMsg(
        error.status === 429
          ? "Se han realizado demasiados intentos. Espera unos minutos."
          : "No se pudo enviar el enlace. Intentalo de nuevo."
      )
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

        {errorMsg && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-4 text-sm text-red-400"
          >
            {errorMsg}
          </p>
        )}

      </div>

    </div>
  )
}
