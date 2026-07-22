"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {

  const router = useRouter()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ready, setReady] = useState(false)
  const [sessionError, setSessionError] = useState("")
  const [formError, setFormError] = useState("")

  /*
   * Flujo anterior conservado como referencia.
   * Se comento porque buscaba tokens del flujo implicito en el hash. El nuevo
   * callback verifica TokenHash en servidor y guarda la sesion en cookies.
  useEffect(() => {
    async function createSession() {
      const hash = window.location.hash

      const params = new URLSearchParams(hash.substring(1))

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          console.error(error)
          return
        }
      }

      setReady(true)
    }

    createSession()
  }, [])
  */

  useEffect(() => {
    let active = true

    async function verifyRecoverySession() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (!active) return

      if (error || !user) {
        setSessionError(
          "El enlace de recuperacion no es valido, ha expirado o ya fue utilizado."
        )
      }

      setReady(true)
    }

    verifyRecoverySession()

    return () => {
      active = false
    }
  }, [])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setFormError("")

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      // Se comento para no mostrar directamente errores internos de Supabase.
      // alert(error.message)
      setFormError(
        "No se pudo actualizar la contrasena. Solicita un enlace nuevo."
      )
      return
    }

    alert("Contraseña actualizada")
    // Se comento porque router.push conservaba la sesion de recuperacion.
    // router.push("/login")
    await supabase.auth.signOut({ scope: "local" })
    router.replace("/login")
    router.refresh()
  }


  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Cargando...
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Enlace no valido
          </h1>
          <p className="mt-4 text-zinc-400">
            {sessionError}
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 block text-blue-400 hover:underline"
          >
            Solicitar otro enlace
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">

      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

        <h1 className="text-2xl font-bold mb-6">
          Nueva contraseña
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="
                w-full
                bg-zinc-900
                border
                border-zinc-700
                p-3
                pr-12
                rounded-xl
                outline-none
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
                hover:text-white
                transition
              "
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          <button
            disabled={loading}
            className="w-full bg-green-600 py-3 rounded-xl hover:bg-green-700 transition font-semibold"
          >
            {loading
              ? "Guardando..."
              : "Cambiar contraseña"}
          </button>

        </form>

        {formError && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-4 text-sm text-red-400"
          >
            {formError}
          </p>
        )}

      </div>

    </div>
  )
}
