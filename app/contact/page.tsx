"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import GenreSelector from "@/components/GenreSelector"
import SubgenreSelector from "@/components/SubgenreSelector"
import TagSelector from "@/components/TagSelector"

import { genresCatalog } from "@/data/genres"
import { metricsCatalog } from "@/data/metrics"

export default function Page() {

  const [titulo, setTitulo] = useState("")
  const [autor, setAutor] = useState("")
  const [esSaga, setEsSaga] = useState(false)

  const [link, setLink] = useState("")
  const [resumen, setResumen] = useState("")
  const [asin, setAsin] = useState("")

  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const [foundAuthor, setFoundAuthor] = useState<any>(null)
  const [useExistingAuthor, setUseExistingAuthor] = useState<boolean | null>(null)

  const [userAuthor, setUserAuthor] = useState<any>(null)
  const [loadingAuthor, setLoadingAuthor] = useState(true)


  useEffect(() => {

    async function loadUserAuthor() {

      const res = await fetch("/api/my-author")

      if (!res.ok) {
        setLoadingAuthor(false)
        return
      }

      const data = await res.json()

      if (data.author) {

        setUserAuthor(data.author)

        setAutor(data.author.name)

        setFoundAuthor(data.author)

        setUseExistingAuthor(true)

      }

      setLoadingAuthor(false)

    }

    loadUserAuthor()

  }, [])


  const isValidASIN = (value: string) =>
    /^[a-zA-Z0-9]{10}$/.test(value)


  async function checkAuthor() {

    if (!autor.trim()) return

    const res = await fetch("/api/authors/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: autor
      })
    })

    const data = await res.json()

    if (data.exists) {

      setFoundAuthor(data.author)
      setUseExistingAuthor(null)

    } else {

      setFoundAuthor(null)
      setUseExistingAuthor(false)

    }

  }


  const validateForm = () => {

    if (!titulo)
      return "El título es obligatorio."

    if (!autor)
      return "El autor es obligatorio."

    if (!asin)
      return "El ASIN es obligatorio."

    if (!isValidASIN(asin))
      return "El ASIN debe tener 10 caracteres alfanuméricos."

    if (!link)
      return "El link de Amazon es obligatorio."

    if (!resumen)
      return "El resumen es obligatorio."

    if (selectedGenres.length === 0)
      return "Selecciona al menos un género."

    if (selectedTags.length === 0)
      return "Selecciona al menos una etiqueta."

    if (!aceptaTerminos)
      return "Debes aceptar la política de privacidad."

    if (foundAuthor && useExistingAuthor === null)
      return "Confirma si eres el autor encontrado."

    return null

  }


  async function handleSubmit() {

    setError("")
    setSent(false)

    const validationError = validateForm()

    if (validationError) {

      setError(validationError)
      return

    }


    setLoading(true)


    try {

      const res = await fetch("/api/libro-nuevo", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          titulo,
          autor,
          esSaga,
          link,
          resumen,
          asin,

          generos: selectedGenres,
          subgeneros: selectedSubgenres,
          tags: selectedTags,

          aceptaTerminos,

          authorId:
            userAuthor
              ? userAuthor.id
              : (
                useExistingAuthor && foundAuthor
                  ? foundAuthor.id
                  : null
              ),

          useExistingAuthor

        })

      })


      const data = await res.json()


      if (!res.ok) {

        setError(
          data.error || "Error al guardar"
        )

        setLoading(false)
        return

      }


      setSent(true)

      setTitulo("")
      setAutor("")
      setEsSaga(false)
      setLink("")
      setResumen("")
      setAsin("")

      setSelectedGenres([])
      setSelectedSubgenres([])
      setSelectedTags([])

      setAceptaTerminos(false)

      setFoundAuthor(null)
      setUseExistingAuthor(null)


    } catch {

      setError(
        "Error de conexión 😢"
      )

    }


    setLoading(false)

  }
  return (
    <section className="
      min-h-screen
      bg-black
      px-4
      py-8
      flex
      items-start
      justify-center
    ">

      <div className="
        w-full
        max-w-xl
        bg-zinc-900
        rounded-2xl
        p-5
        sm:p-8
        shadow-xl
      ">

        <h1 className="
          text-2xl
          sm:text-3xl
          font-bold
          mb-2
        ">
          Registrar libro nuevo
        </h1>

        <p className="
          text-zinc-400
          text-sm
          sm:text-base
          mb-6
        ">
          Recomienda tu libro o uno que te haya gustado. Llena los datos tal como quieres que se muestren en la página.
        </p>


        <input
          type="text"
          placeholder="Título del libro (máx. 50 caracteres)"
          maxLength={50}
          value={titulo}
          onChange={e => setTitulo(e.target.value.toUpperCase())}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />


        <input
          type="text"
          placeholder="Nombre del autor (como aparece en Amazon)"
          value={autor}
          disabled={!!userAuthor}
          onChange={e => {
            setAutor(e.target.value)
            setFoundAuthor(null)
            setUseExistingAuthor(null)
          }}
          onBlur={!userAuthor ? checkAuthor : undefined}
          className={`w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${userAuthor ? "opacity-60 cursor-not-allowed" : ""
            }`}
        />


        {foundAuthor && !userAuthor && (

          <div className="
            mb-4
            p-4
            rounded-xl
            bg-yellow-500/10
            border
            border-yellow-500/30
            text-sm
          ">

            <p className="text-yellow-400 mb-3">
              Encontramos un autor con este nombre:
            </p>

            <p className="text-zinc-200 font-semibold mb-3">
              {foundAuthor.name}
            </p>

            <p className="mb-3 text-zinc-300">
              ¿Eres tú este autor?
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => {
                  setUseExistingAuthor(true)
                }}
                className={`
                  px-4
                  py-2
                  rounded-lg
                  ${useExistingAuthor === true
                    ? "bg-green-600"
                    : "bg-zinc-700"
                  }
                `}
              >
                Sí, soy yo
              </button>


              <button
                type="button"
                onClick={() => {
                  setUseExistingAuthor(false)
                }}
                className={`
                  px-4
                  py-2
                  rounded-lg
                  ${useExistingAuthor === false
                    ? "bg-red-600"
                    : "bg-zinc-700"
                  }
                `}
              >
                No
              </button>

            </div>

          </div>

        )}



        <div className="mb-4">

          <p className="mb-2 text-sm text-zinc-300">
            ¿Es parte de una saga?
          </p>

          <label className="flex items-center text-sm cursor-pointer">

            <input
              type="checkbox"
              checked={esSaga}
              onChange={e => setEsSaga(e.target.checked)}
              className="mr-2"
            />

            Sí

          </label>

        </div>



        <input
          type="text"
          placeholder="Link de Amazon"
          value={link}
          onChange={e => setLink(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />


        <div className="mb-4">

          <p className="mb-2 text-sm text-zinc-300">
            ASIN de la versión Ebook
            <span className="block text-yellow-400 text-sm mt-1">
              (recomendamos copiar y pegar directamente desde Amazon para evitar errores)
            </span>
          </p>

          <input
            type="text"
            placeholder="ASIN del ebook"
            maxLength={10}
            value={asin}
            onChange={e => setAsin(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

        </div>


        <textarea
          placeholder="¿De qué trata el libro?"
          maxLength={999}
          value={resumen}
          onChange={e => setResumen(e.target.value)}
          className="w-full p-4 mb-2 rounded-xl bg-zinc-800 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />


        <p className="
          text-xs
          text-zinc-500
          mb-6
          text-right
        ">
          {resumen.length}/999
        </p>


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



        <div className="mb-6">

          <label className="
            flex
            items-start
            gap-3
            text-sm
            text-zinc-300
          ">

            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={e => setAceptaTerminos(e.target.checked)}
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



        {error && (

          <div className="
            bg-red-500/10
            border
            border-red-500/30
            text-red-400
            p-3
            rounded-lg
            mb-4
            text-sm
          ">
            {error}
          </div>

        )}



        {sent && (

          <div className="
            bg-green-500/10
            border
            border-green-500/30
            text-green-400
            p-3
            rounded-lg
            mb-4
            text-sm
          ">
            ¡Libro guardado correctamente! Puede tardar unos minutos para que aparezca en el catálogo.
          </div>

        )}



        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            w-full
            sm:w-auto
            px-8
            py-4
            rounded-xl
            font-semibold
            bg-yellow-500
            text-black
            hover:bg-yellow-400
            transition
            disabled:opacity-50
          "
        >
          {loading ? "Guardando..." : "Enviar libro"}
        </button>


      </div>

    </section>
  )

}