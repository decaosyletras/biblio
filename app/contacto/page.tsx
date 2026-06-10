"use client"

import { useState } from "react"
import GenreSelector from "@/components/GenreSelector"
import SubgenreSelector from "@/components/SubgenreSelector"
import { genresCatalog } from "@/data/genres"
import TagSelector from "@/components/TagSelector"
import { metricsCatalog } from "@/data/metrics"

export default function Page() {
  const [titulo, setTitulo] = useState("")
  const [autor, setAutor] = useState("")
  const [esAutor, setEsAutor] = useState("")
  const [registrante, setRegistrante] = useState("")

  const [esSaga, setEsSaga] = useState(false)

  const [link, setLink] = useState("")
  const [resumen, setResumen] = useState("")
  const [asin, setAsin] = useState("")

  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const isValidASIN = (value: string) =>
    /^[a-zA-Z0-9]{10}$/.test(value)

  const validateForm = () => {
    if (!titulo) return "El título es obligatorio."
    if (!autor) return "El autor es obligatorio."
    if (!esAutor) return "Debes indicar si eres el autor."

    if (esAutor === "no" && !registrante)
      return "Debes indicar quién registra el libro."

    if (!link) return "El link de Amazon es obligatorio."
    if (!resumen) return "El resumen es obligatorio."

    if (!asin) return "El ASIN es obligatorio."
    if (!isValidASIN(asin))
      return "El ASIN debe tener 10 caracteres alfanuméricos."

    if (selectedGenres.length === 0)
      return "Selecciona al menos un género."
    
    if (selectedTags.length === 0)
      return "Selecciona al menos una etiqueta."

    if (!aceptaTerminos)
      return "Debes aceptar la política de privacidad."

    return null
  }

  const handleSubmit = async () => {
    setError("")
    setSent(false)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
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
          titulo,
          autor,
          esAutor,
          registrante: esAutor === "no" ? registrante : null,
          esSaga,
          link,
          resumen,
          asin,
          generos: selectedGenres,
          subgeneros: selectedSubgenres,
          tags: selectedTags,
          aceptaTerminos
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al guardar")
        setLoading(false)
        return
      }

      setSent(true)

      // reset
      setTitulo("")
      setAutor("")
      setEsAutor("")
      setRegistrante("")
      setEsSaga(false)
      setLink("")
      setResumen("")
      setAsin("")
      setSelectedGenres([])
      setSelectedSubgenres([])
      setAceptaTerminos(false)

    } catch (err) {
      setError("Error de conexión 😢")
    }

    setLoading(false)
  }

  return (
    <section className="min-h-screen bg-black px-4 py-8 flex items-start justify-center">
      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl p-5 sm:p-8 shadow-xl">

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Comparte un libro
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base mb-6">
          Recomienda tu libro o uno que te haya gustado. Llena los datos tal como quieres que se muestren en la página.
        </p>

        {/* TITULO */}
        <input
          type="text"
          placeholder="Título del libro (máx. 50 caracteres)"
          maxLength={50}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value.toUpperCase())}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />

        {/* AUTOR */}
        <input
          type="text"
          placeholder="Nombre del autor (como en Amazon)"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />

        {/* RADIO */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-zinc-300">
            ¿Eres el autor del libro?
          </p>

          <label className="mr-4 text-sm">
            <input
              type="radio"
              name="esAutor"
              value="si"
              checked={esAutor === "si"}
              onChange={(e) => setEsAutor(e.target.value)}
              className="mr-1"
            />
            Sí
          </label>

          <label className="text-sm">
            <input
              type="radio"
              name="esAutor"
              value="no"
              checked={esAutor === "no"}
              onChange={(e) => setEsAutor(e.target.value)}
              className="mr-1"
            />
            No
          </label>
        </div>

        {/* SAGA */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-zinc-300">
            ¿Es parte de una saga?
          </p>

          <label className="flex items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={esSaga}
              onChange={(e) => setEsSaga(e.target.checked)}
              className="mr-2"
            />
            Sí
          </label>
        </div>

        {/* REGISTRANTE */}
        {esAutor === "no" && (
          <input
            type="text"
            placeholder="Nombre de quien registra"
            value={registrante}
            onChange={(e) => setRegistrante(e.target.value)}
            className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
          />
        )}

        {/* LINK */}
        <input
          type="text"
          placeholder="Link de Amazon"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />

        {/* ASIN */}
        <input
          type="text"
          placeholder="ASIN del ebook (versión digital)"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          maxLength={10}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />

        {/* RESUMEN */}
        <textarea
          placeholder="¿De qué trata el libro?"
          maxLength={700}
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          className="w-full p-4 mb-2 rounded-xl bg-zinc-800 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />

        <p className="text-xs text-zinc-500 mb-6 text-right">
          {resumen.length}/700
        </p>

        {/* GENRES */}
        <div className="mb-6 space-y-4">
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

          <TagSelector
            tagsCatalog={metricsCatalog}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>

        {/* CONSENTIMIENTO */}
          <div className="mb-6">
            <label className="flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1"
              />

              <span>
                He leído y acepto la{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  className="text-yellow-400 hover:underline"
                >
                  Política de Privacidad
                </a>
              </span>
            </label>
          </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {sent && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 text-sm">
            ¡Gracias! Tu libro fue enviado 🙌
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto sm:px-8 py-4 rounded-xl font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>

        <p className="text-zinc-400 text-sm sm:text-base mb-6 mt-6">
          Todos los libros pasarán por una verificación en la información. Solicitamos un poco de paciencia.
        </p>

      </div>
    </section>
  )
}