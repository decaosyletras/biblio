"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BOOK_COVER_CONSENT_TEXT } from "@/lib/bookCoverConsent"

import GenreSelector from "@/components/GenreSelector"
import SubgenreSelector from "@/components/SubgenreSelector"
import TagSelector from "@/components/TagSelector"

import { genresCatalog } from "@/data/genres"
import { metricsCatalog } from "@/data/metrics"

type AdditionalAuthor = {
  name: string
  foundAuthor: {
    id: string
    name: string
  } | null
  useExistingAuthor: boolean | null
}

type AuthorMatch = {
  id: string
  name: string
  slug?: string
}

type UserAuthor = AuthorMatch & {
  claimStatus: "pending" | "approved"
}

export default function Page() {

  const [titulo, setTitulo] = useState("")
  const [autor, setAutor] = useState("")
  // Se comento el arreglo de textos porque cada coautor ahora conserva su
  // coincidencia encontrada y la decision explicita de asociarla o no.
  // const [autoresAdicionales, setAutoresAdicionales] = useState<string[]>([])
  const [autoresAdicionales, setAutoresAdicionales] = useState<AdditionalAuthor[]>([])
  const [esSaga, setEsSaga] = useState(false)

  const [link, setLink] = useState("")
  const [resumen, setResumen] = useState("")
  const [asin, setAsin] = useState("")

  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [confirmaAutoria, setConfirmaAutoria] = useState(false)
  const [coverRightsConfirmed, setCoverRightsConfirmed] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("")
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const [foundAuthor, setFoundAuthor] = useState<AuthorMatch | null>(null)
  const [useExistingAuthor, setUseExistingAuthor] = useState<boolean | null>(null)

  const [userAuthor, setUserAuthor] = useState<UserAuthor | null>(null)
  const [sessionState, setSessionState] = useState<
    "loading" | "authenticated" | "guest" | "error"
  >("loading")
  const [ownershipCreated, setOwnershipCreated] = useState(false)


  useEffect(() => {

    async function loadUserAuthor() {
      try {
        const res = await fetch("/api/my-author")

        if (res.status === 401) {
          setSessionState("guest")
          return
        }

        if (!res.ok) {
          setSessionState("error")
          return
        }

        const data = await res.json()

        if (data.author) {
          setUserAuthor({
            ...data.author,
            claimStatus: data.claimStatus
          })
          setAutor(data.author.name)
          setFoundAuthor(data.author)
          setUseExistingAuthor(true)
        }

        setSessionState("authenticated")
      } catch {
        setSessionState("error")
      }

    }

    loadUserAuthor()

  }, [])

  useEffect(() => {
    if (!coverFile) return

    let active = true
    const reader = new FileReader()
    reader.onload = () => {
      if (active && typeof reader.result === "string") {
        setCoverPreviewUrl(reader.result)
      }
    }
    reader.readAsDataURL(coverFile)

    return () => {
      active = false
      reader.abort()
    }
  }, [coverFile])


  const isValidASIN = (value: string) =>
    /^[A-Z0-9]{10}$/.test(value.trim().toUpperCase())


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

  async function checkAdditionalAuthor(index: number) {

    const additionalAuthor = autoresAdicionales[index]

    if (!additionalAuthor?.name.trim()) return

    const res = await fetch("/api/authors/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: additionalAuthor.name
      })
    })

    const data = await res.json()

    setAutoresAdicionales(currentAuthors =>
      currentAuthors.map((currentAuthor, currentIndex) => {
        if (currentIndex !== index) return currentAuthor

        return {
          ...currentAuthor,
          foundAuthor: data.exists ? data.author : null,
          useExistingAuthor: data.exists ? null : false
        }
      })
    )

  }


  const validateForm = () => {

    if (!titulo)
      return "El título es obligatorio."

    if (!autor)
      return "El autor es obligatorio."

    if (autoresAdicionales.some(({ name }) => !name.trim()))
      return "Completa o elimina los autores adicionales."

    if (autoresAdicionales.some(
      ({ foundAuthor, useExistingAuthor }) =>
        foundAuthor && useExistingAuthor === null
    ))
      return "Confirma cada coincidencia de autor antes de enviar."

    if (!coverFile)
      return "La portada es obligatoria."

    if (coverFile.size > 2 * 1024 * 1024)
      return "La portada debe pesar máximo 2 MB."

    if (!["image/jpeg", "image/png", "image/webp"].includes(coverFile.type))
      return "La portada debe ser JPG, PNG o WebP."

    if (!coverRightsConfirmed)
      return "Debes confirmar que puedes proporcionar esta portada."

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

    if (!confirmaAutoria)
      return "Debes confirmar que eres autor o coautor de esta obra."

    if (foundAuthor && useExistingAuthor === null)
      return "Confirma la coincidencia de autor antes de enviar."

    if (foundAuthor && useExistingAuthor === true && !userAuthor)
      return "Este autor ya existe. Reclámalo antes de registrar libros en su nombre."

    return null

  }


  async function handleSubmit() {

    setError("")
    setSent(false)
    setOwnershipCreated(false)

    const validationError = validateForm()

    if (validationError) {

      setError(validationError)
      return

    }


    setLoading(true)


    try {

      const payload = {
        titulo,
        autor,
        autoresAdicionales: autoresAdicionales.map((additionalAuthor) => ({
          name: additionalAuthor.name,
          useExistingAuthor: additionalAuthor.useExistingAuthor
        })),
        esSaga,
        link,
        resumen,
        asin: asin.trim().toUpperCase(),
        generos: selectedGenres,
        subgeneros: selectedSubgenres,
        tags: selectedTags,
        aceptaTerminos,
        confirmaAutoria,
        coverRightsConfirmed,
        useExistingAuthor
      }

      const submission = new FormData()
      submission.set("payload", JSON.stringify(payload))
      submission.set("cover", coverFile!)

      const res = await fetch("/api/libro-nuevo", {

        method: "POST",
        body: submission

      })


      const data = await res.json()


      if (!res.ok) {

        if (res.status === 401) {
          setSessionState("guest")
        }

        setError(
          data.error || "Error al guardar"
        )

        setLoading(false)
        return

      }


      setSent(true)
      setOwnershipCreated(Boolean(data.ownershipCreated))

      const resolvedAuthor = data.author ?? userAuthor

      setTitulo("")
      setAutor(resolvedAuthor?.name ?? "")
      setAutoresAdicionales([])
      setEsSaga(false)
      setLink("")
      setResumen("")
      setAsin("")

      setSelectedGenres([])
      setSelectedSubgenres([])
      setSelectedTags([])

      setAceptaTerminos(false)
      setConfirmaAutoria(false)
      setCoverRightsConfirmed(false)
      setCoverFile(null)
      setCoverPreviewUrl("")
      if (coverInputRef.current) coverInputRef.current.value = ""

      if (
        resolvedAuthor?.id &&
        resolvedAuthor?.name &&
        resolvedAuthor?.claimStatus
      ) {
        const savedUserAuthor: UserAuthor = {
          id: resolvedAuthor.id,
          name: resolvedAuthor.name,
          slug: resolvedAuthor.slug,
          claimStatus: resolvedAuthor.claimStatus
        }
        setUserAuthor(savedUserAuthor)
        setFoundAuthor(savedUserAuthor)
        setUseExistingAuthor(true)
      } else {
        setFoundAuthor(null)
        setUseExistingAuthor(null)
      }


    } catch {

      setError(
        "Error de conexión 😢"
      )

    }


    setLoading(false)

  }
  if (sessionState === "loading") {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black px-4 text-zinc-300">
        Verificando tu sesión...
      </section>
    )
  }

  if (sessionState === "guest") {
    return (
      <section className="flex min-h-screen items-start justify-center bg-black px-4 py-16 text-zinc-100">
        <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-7 text-center sm:p-10">
          <h1 className="text-3xl font-bold">Registra uno de tus libros</h1>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Inicia sesión para agregar tu obra y asociarla correctamente con tu
            espacio de autor.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/tutorial/autores"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-medium transition hover:bg-zinc-800"
            >
              Ver tutorial para autores
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (sessionState === "error") {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black px-4 text-zinc-100">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 p-7 text-center">
          <h1 className="text-2xl font-bold">No pudimos verificar tu cuenta</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Recarga la página para intentarlo nuevamente. No se ha guardado ningún dato.
          </p>
        </div>
      </section>
    )
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
          Agrega uno de tus libros. Llena los datos tal como quieres que se muestren en el catálogo.
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

        {userAuthor && (
          <div className={`mb-4 rounded-xl border p-4 text-sm ${
            userAuthor.claimStatus === "pending"
              ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
              : "border-green-500/30 bg-green-500/10 text-green-200"
          }`}>
            {userAuthor.claimStatus === "pending"
              ? "Tu reclamación sigue pendiente. Mientras la revisamos, los libros que registres quedarán asociados a este autor."
              : "Este libro quedará asociado automáticamente a tu página de autor."}
          </div>
        )}

        <div className="mb-4">

          {autoresAdicionales.map((autorAdicional, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nombre de otro autor (como aparece en Amazon)"
                value={autorAdicional.name}
                onChange={e => {
                  const nuevosAutores = [...autoresAdicionales]
                  nuevosAutores[index] = {
                    name: e.target.value,
                    foundAuthor: null,
                    useExistingAuthor: null
                  }
                  setAutoresAdicionales(nuevosAutores)
                }}
                onBlur={() => checkAdditionalAuthor(index)}
                className="w-full p-4 rounded-xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />

              <button
                type="button"
                onClick={() => setAutoresAdicionales(
                  autoresAdicionales.filter((_, authorIndex) => authorIndex !== index)
                )}
                aria-label="Eliminar autor adicional"
                className="px-4 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-300 transition"
              >
                ×
              </button>
            </div>
          ))}

          {autoresAdicionales.map((autorAdicional, index) => (
            autorAdicional.foundAuthor && (
              <div
                key={`match-${index}`}
                className="mb-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm"
              >
                <p className="text-yellow-400 mb-2">
                  Encontramos un autor con este nombre:
                </p>

                <p className="text-zinc-200 font-semibold mb-3">
                  {autorAdicional.foundAuthor.name}
                </p>

                <p className="mb-3 text-zinc-300">
                  ¿Quieres asociar este libro a este perfil?
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAutoresAdicionales(currentAuthors =>
                      currentAuthors.map((currentAuthor, currentIndex) =>
                        currentIndex === index
                          ? { ...currentAuthor, useExistingAuthor: true }
                          : currentAuthor
                      )
                    )}
                    className={`px-4 py-2 rounded-lg ${
                      autorAdicional.useExistingAuthor === true
                        ? "bg-green-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    Sí, asociar
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoresAdicionales(currentAuthors =>
                      currentAuthors.map((currentAuthor, currentIndex) =>
                        currentIndex === index
                          ? { ...currentAuthor, useExistingAuthor: false }
                          : currentAuthor
                      )
                    )}
                    className={`px-4 py-2 rounded-lg ${
                      autorAdicional.useExistingAuthor === false
                        ? "bg-red-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    No, es otra persona
                  </button>
                </div>
              </div>
            )
          ))}

          <button
            type="button"
            onClick={() => setAutoresAdicionales([
              ...autoresAdicionales,
              {
                name: "",
                foundAuthor: null,
                useExistingAuthor: null
              }
            ])}
            className="text-sm text-yellow-400 hover:text-yellow-300 hover:underline"
          >
            [+] agregar autor
          </button>

        </div>


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
              ¿Quieres asociar este libro a este perfil?
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
                Sí, es mi perfil
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
                No, es otra persona
              </button>

            </div>

            {useExistingAuthor === true && (
              <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-200">
                Para proteger los perfiles existentes, primero debes reclamar
                este autor. Busca uno de sus libros y selecciona Reclamar autor.
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href="/libros" className="font-semibold hover:underline">
                    Buscar un libro
                  </Link>
                  <Link
                    href="/tutorial/autores"
                    className="font-semibold hover:underline"
                  >
                    Ver tutorial
                  </Link>
                </div>
              </div>
            )}

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

        <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
          <div>
            <p className="font-semibold text-zinc-100">
              Portada del libro <span className="text-yellow-400">*</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Sube la portada que quieres mostrar en el catálogo. Se optimizará
              automáticamente para reducir su peso.
            </p>
          </div>

          {coverPreviewUrl && (
            <div className="mt-4 flex justify-center rounded-2xl border border-zinc-800 bg-black p-3">
              {/* La vista previa usa exclusivamente el archivo local elegido por el usuario. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreviewUrl}
                alt="Vista previa de la portada"
                className="max-h-80 rounded-lg object-contain"
              />
            </div>
          )}

          <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-700">
            {coverFile ? "Cambiar portada" : "Seleccionar portada"}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const selectedCover = event.target.files?.[0] ?? null
                setCoverRightsConfirmed(false)

                if (
                  selectedCover &&
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    selectedCover.type
                  )
                ) {
                  setError("La portada debe ser JPG, PNG o WebP.")
                  setCoverFile(null)
                  setCoverPreviewUrl("")
                  event.target.value = ""
                  return
                }

                if (selectedCover && selectedCover.size > 2 * 1024 * 1024) {
                  setError("La portada debe pesar máximo 2 MB.")
                  setCoverFile(null)
                  setCoverPreviewUrl("")
                  event.target.value = ""
                  return
                }

                setCoverFile(selectedCover)
                if (!selectedCover) setCoverPreviewUrl("")
                setError("")
              }}
              className="sr-only"
            />
          </label>

          <p className="mt-2 text-xs text-zinc-500">
            JPG, PNG o WebP de hasta 2 MB. Recomendamos una imagen vertical.
          </p>

          <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
            <input
              type="checkbox"
              checked={coverRightsConfirmed}
              onChange={(event) => setCoverRightsConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>{BOOK_COVER_CONSENT_TEXT}</span>
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
            onChange={e =>
              setAsin(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
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

          <label className="mb-4 flex items-start gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={confirmaAutoria}
              onChange={e => setConfirmaAutoria(e.target.checked)}
              className="mt-1"
            />
            <span>
              Confirmo que soy autor o coautor de esta obra y que los datos
              proporcionados son correctos. También acepto la{" "}
              <a
                href="/politica"
                target="_blank"
                className="text-yellow-400 hover:underline"
              >
                Política de reclamación de autores
              </a>
              .
            </span>
          </label>

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
            {ownershipCreated
              ? "¡Libro guardado! También creamos y asociamos tu página de autor. A partir de ahora tus nuevos libros usarán este autor automáticamente."
              : "¡Libro guardado correctamente! Puede tardar unos minutos para que aparezca en el catálogo."}
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
