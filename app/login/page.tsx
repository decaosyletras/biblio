"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleAuth = async () => {
    setLoading(true)

    if (isLogin) {
      // 🔐 LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
      } else {
        router.push("/")
      }
    } else {
      // 🧑‍💻 REGISTRO
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        alert(error.message)
      } else {
        alert("Cuenta creada. Revisa tu correo si activaste confirmación.")
        setIsLogin(true)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4">
      <div className="w-full max-w-md bg-zinc-800 p-6 rounded-xl space-y-4">

        <h1 className="text-2xl font-semibold text-center">
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {!isLogin && (
          <input
            className="w-full p-3 rounded bg-zinc-700 text-white"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="w-full p-3 rounded bg-zinc-700 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-zinc-700 text-white"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded font-medium hover:opacity-80 transition"
        >
          {loading ? "Cargando..." : isLogin ? "Entrar" : "Crear cuenta"}
        </button>

        <p className="text-sm text-center text-zinc-400">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-yellow-400 hover:underline"
          >
            {isLogin ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  )
}