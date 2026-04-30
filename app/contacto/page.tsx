"use client"

import { useState } from "react"
import GenreSelector from "@/components/GenreSelector"
import SubgenreSelector from "@/components/SubgenreSelector"
import { genresCatalog } from "@/data/genres"

export default function Page() {
  const [link, setLink] = useState("")
  const [resumen, setResumen] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setSent(false)

    if (!link || !resumen || selectedGenres.length === 0) {
      setError("Completa todos los campos obligatorios")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/libros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          link,
          resumen,
          generos: selectedGenres,
          subgeneros: selectedSubgenres
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al guardar")
        setLoading(false)
        return
      }

      // ✅ éxito
      setSent(true)

      // reset form
      setLink("")
      setResumen("")
      setSelectedGenres([])
      setSelectedSubgenres([])

    } catch (err) {
      setError("Error de conexión 😢")
    }

    setLoading(false)
  }

  return (
    <section className="max-w-3xl mx-auto text-white">

      <h1 className="text-3xl font-bold mb-4">
        Comparte un libro independiente
      </h1>

      <p className="text-zinc-400 mb-6">
        Puedes registrar tu libro o uno que te haya gustado.
      </p>

      {/* LINK */}
      <input
        type="text"
        placeholder="Link de Amazon"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full p-3 mb-4 rounded bg-zinc-800"
      />

      {/* RESUMEN */}
      <textarea
        placeholder="¿De qué va?"
        maxLength={700}
        value={resumen}
        onChange={(e) => setResumen(e.target.value)}
        className="w-full p-3 mb-2 rounded bg-zinc-800 h-32"
      />

      <p className="text-xs text-zinc-500 mb-6">
        {resumen.length}/700
      </p>

      {/* GENRES */}
      <GenreSelector
        genresCatalog={genresCatalog}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
      />

      <SubgenreSelector
        genresCatalog={genresCatalog}
        selectedGenres={selectedGenres}
        selectedSubgenres={selectedSubgenres}
        setSelectedSubgenres={setSelectedSubgenres}
      />

      {/* ❌ ERROR */}
      {error && (
        <p className="text-red-400 mb-4 text-sm">
          {error}
        </p>
      )}

      {/* ✅ SUCCESS */}
      {sent && (
        <p className="text-green-400 mb-4 text-sm">
          ¡Listo! Realizaremos un proceso de revisión para dar de alta tu libro. ¡Muchas gracias! 🙌
        </p>
      )}

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-yellow-500 text-black px-6 py-3 rounded-full disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>

    </section>
  )
}