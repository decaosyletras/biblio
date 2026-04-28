"use client"

import { useState } from "react"
import { FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa"

export default function ConocemePage() {
  const [error, setError] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Algo salió mal")
        return
      }

      setSent(true)
      setNombre("")
      setApellido("")
      setEmail("")

    } catch (err) {
      setError("Error de conexión 😢")
    }
  }

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto text-zinc-100">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-4">
        👋 Sobre mí
      </h1>

      <p className="text-zinc-300 leading-relaxed mb-6">
        Soy un lector enfocado en descubrir libros poco conocidos pero con
        gran valor, especialmente de autores independientes.
      </p>

      {/* REDES + SAGA */}
      <div className="flex flex-wrap items-center gap-4 mb-10">

        <a
          href="https://twitter.com/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
        >
          <FaTwitter /> Twitter
        </a>

        <a
          href="https://instagram.com/usuario"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
        >
          <FaInstagram /> Instagram
        </a>

        <a
          href="https://decaosyletras.github.io/traselcaosdelaexistencia/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          <FaGlobe /> Ver mi saga
        </a>

      </div>

      {/* BLOQUE FUTURO */}
      <div className="mt-10 p-6 bg-zinc-900 rounded-xl border border-zinc-800">

        <h2 className="text-xl font-semibold mb-3">
          🚀 Próxima versión
        </h2>

        <p className="text-zinc-400 mb-4">
          Estoy trabajando en una segunda versión de esta plataforma donde los
          lectores y escritores independientes podrán interactuar directamente.
          La idea es que los autores puedan agregar sus libros, recibir
          visibilidad y conectar con lectores reales.
        </p>

        <p className="text-zinc-400 mb-6">
          Si quieres ser de los primeros en formar parte, agregar tus libros o
          simplemente apoyar este proyecto, deja tu correo aquí:
        </p>

        {sent ? (
          <p className="text-green-400">
            ¡Gracias! 🙌 pronto tendrás noticias.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">

            <input
              type="text"
              required
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 min-w-[120px] px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 outline-none"
            />

            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              ✨ Unirme
            </button>

            {error && (
              <p className="w-full text-red-400 mt-2 text-sm">
                {error}
              </p>
            )}

          </form>
        )}

      </div>

    </section>
  )
}