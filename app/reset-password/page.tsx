"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {

  const router = useRouter()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Contraseña actualizada")

    router.push("/login")
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
            className="w-full bg-green-600 py-3 rounded"
          >
            {loading
              ? "Guardando..."
              : "Cambiar contraseña"}
          </button>

        </form>

      </div>

    </div>
  )
}