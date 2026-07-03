"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return alert(error.message)

    router.push("/me")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>

        <form onSubmit={login} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-semibold">
            Entrar
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-400">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}