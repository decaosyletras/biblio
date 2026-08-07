"use client"

import { useEffect, useId, useState } from "react"
import {
  Download,
  LoaderCircle,
  Share2,
  Sparkles,
  X,
} from "lucide-react"
import CoverImage from "@/components/CoverImage"
import ShareImageThemePicker from "@/components/readers/ShareImageThemePicker"
import {
  SHARE_IMAGE_PALETTES,
  SHARE_IMAGE_THEME_STORAGE_KEY,
  isShareImageTheme,
  type ShareImageTheme,
} from "@/lib/shareImageThemes"

type ShareImageFormat = "story" | "post"

type Props = {
  bookId: string
  bookSlug: string
  bookTitle: string
  authors: string
  coverSrc: string
}

const formats: Array<{
  value: ShareImageFormat
  label: string
  dimensions: string
}> = [
  { value: "story", label: "Historia", dimensions: "1080 × 1920" },
  { value: "post", label: "Publicación vertical", dimensions: "1080 × 1350" },
]

export default function BookRecommendationShareButton({
  bookId,
  bookSlug,
  bookTitle,
  authors,
  coverSrc,
}: Props) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] =
    useState<ShareImageFormat>("story")
  const [selectedTheme, setSelectedTheme] =
    useState<ShareImageTheme>("emerald")
  const [activeAction, setActiveAction] = useState<"download" | "share" | null>(
    null
  )
  const [supportsFileSharing, setSupportsFileSharing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof navigator.share !== "function" || !navigator.canShare) return

    const sampleFile = new File(["share"], "recomendacion.png", {
      type: "image/png",
    })
    setSupportsFileSharing(navigator.canShare({ files: [sampleFile] }))
  }, [])

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(
        SHARE_IMAGE_THEME_STORAGE_KEY
      )
      if (isShareImageTheme(storedTheme)) setSelectedTheme(storedTheme)
    } catch {
      // La imagen sigue funcionando con el tema predeterminado si el
      // navegador bloquea el almacenamiento local.
    }
  }, [])

  const selectTheme = (theme: ShareImageTheme) => {
    setSelectedTheme(theme)
    try {
      window.localStorage.setItem(SHARE_IMAGE_THEME_STORAGE_KEY, theme)
    } catch {
      // La preferencia simplemente no se recordará en este navegador.
    }
  }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeAction === null) setOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeAction, open])

  const createImageFile = async () => {
    const params = new URLSearchParams({
      bookId,
      format: selectedFormat,
      theme: selectedTheme,
    })
    const response = await fetch(
      `/api/readers/book-recommendation-image?${params.toString()}`
    )

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(payload?.error || "No se pudo crear la recomendación")
    }

    const blob = await response.blob()
    const filename = `recomendacion-${bookSlug}-${selectedFormat}.png`

    return {
      blob,
      filename,
      file: new File([blob], filename, { type: "image/png" }),
    }
  }

  const selectedPalette = SHARE_IMAGE_PALETTES[selectedTheme]

  const downloadImage = async () => {
    setActiveAction("download")
    setError("")

    try {
      const { blob, filename } = await createImageFile()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo crear la recomendación"
      )
    } finally {
      setActiveAction(null)
    }
  }

  const shareImage = async () => {
    setActiveAction("share")
    setError("")

    try {
      const { file } = await createImageFile()

      if (!navigator.canShare?.({ files: [file] })) {
        throw new Error(
          "Este dispositivo no permite compartir la imagen directamente"
        )
      }

      await navigator.share({
        files: [file],
        title: `Te recomiendo ${bookTitle}`,
        text: `Te recomiendo “${bookTitle}”, de ${authors}, en Cas(z)a de Libros.`,
        url: window.location.href,
      })
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return
      }

      setError(
        shareError instanceof Error
          ? shareError.message
          : "No se pudo compartir la recomendación"
      )
    } finally {
      setActiveAction(null)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("")
          setOpen(true)
        }}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-200 transition hover:bg-green-500/15 sm:w-auto"
      >
        <Sparkles size={15} aria-hidden="true" />
        Compartir mi recomendación
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && activeAction === null) {
              setOpen(false)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-zinc-100">
                  Comparte tu recomendación
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Generaremos una imagen con el libro y tu perfil de lector.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                disabled={activeAction !== null}
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
              <div
                className={`relative mx-auto flex w-full max-w-[190px] flex-col items-center overflow-hidden rounded-2xl border p-4 text-center shadow-xl ${
                  selectedFormat === "story" ? "aspect-[9/16]" : "aspect-[4/5]"
                }`}
                style={{
                  background: selectedPalette.background,
                  borderColor: selectedPalette.accentBorder,
                }}
              >
                <p
                  className="text-[8px] font-bold tracking-wider"
                  style={{ color: selectedPalette.accent }}
                >
                  TE RECOMIENDO UNA LECTURA INDIE
                </p>
                <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg shadow-lg">
                  <CoverImage
                    src={coverSrc}
                    alt=""
                    className="h-full max-h-full w-auto object-cover"
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-xs font-bold text-white">
                  {bookTitle}
                </p>
                <p className="mt-1 line-clamp-1 text-[9px] text-zinc-400">
                  {authors}
                </p>
                <p
                  className="mt-auto pt-3 text-[8px] font-semibold"
                  style={{ color: selectedPalette.accent }}
                >
                  CAS(Z)A DE LIBROS
                </p>
              </div>

              <div>
                <fieldset>
                  <legend className="mb-2 text-xs font-medium text-zinc-400">
                    Formato
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((format) => (
                      <label
                        key={format.value}
                        className={`cursor-pointer rounded-xl border px-3 py-3 transition ${
                          selectedFormat === format.value
                            ? "border-yellow-400/60 bg-yellow-400/10"
                            : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="book-recommendation-format"
                          value={format.value}
                          checked={selectedFormat === format.value}
                          onChange={() => setSelectedFormat(format.value)}
                          className="sr-only"
                        />
                        <span className="block text-xs font-semibold text-zinc-100 sm:text-sm">
                          {format.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-zinc-500 sm:text-xs">
                          {format.dimensions}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-4">
                  <ShareImageThemePicker
                    name="book-recommendation-theme"
                    value={selectedTheme}
                    onChange={selectTheme}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={downloadImage}
                    disabled={activeAction !== null}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                      supportsFileSharing
                        ? "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                        : "bg-yellow-500 text-black hover:bg-yellow-400"
                    }`}
                  >
                    {activeAction === "download" ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Download size={17} aria-hidden="true" />
                    )}
                    {activeAction === "download" ? "Creando..." : "Descargar"}
                  </button>

                  {supportsFileSharing && (
                    <button
                      type="button"
                      onClick={shareImage}
                      disabled={activeAction !== null}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-wait disabled:opacity-60"
                    >
                      {activeAction === "share" ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Share2 size={17} aria-hidden="true" />
                      )}
                      {activeAction === "share" ? "Preparando..." : "Compartir"}
                    </button>
                  )}
                </div>

                {error && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
