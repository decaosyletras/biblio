"use client"

import { useEffect, useId, useState } from "react"
import {
  BookOpen,
  Crown,
  Download,
  ImageDown,
  LoaderCircle,
  Megaphone,
  Share2,
  UserRound,
  X,
} from "lucide-react"
import type {
  AuthorShareImageFormat,
  AuthorShareImageKind,
} from "@/lib/authorShareImage"

type Props = {
  authorId: string
  authorSlug: string
  authorName: string
  isPro: boolean
  hasFeaturedBook: boolean
  hasNews: boolean
  primaryColor: string
}

const FORMATS: Array<{
  value: AuthorShareImageFormat
  label: string
  dimensions: string
}> = [
  { value: "story", label: "Historia", dimensions: "1080 × 1920" },
  { value: "post", label: "Publicación", dimensions: "1080 × 1350" },
]

export default function AuthorShareImageButton({
  authorId,
  authorSlug,
  authorName,
  isPro,
  hasFeaturedBook,
  hasNews,
  primaryColor,
}: Props) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<AuthorShareImageKind>("profile")
  const [format, setFormat] = useState<AuthorShareImageFormat>("story")
  const [activeAction, setActiveAction] = useState<"download" | "share" | null>(
    null
  )
  const [supportsFileSharing, setSupportsFileSharing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof navigator.share !== "function" || !navigator.canShare) return

    const sampleFile = new File(["share"], "autor.png", { type: "image/png" })
    setSupportsFileSharing(navigator.canShare({ files: [sampleFile] }))
  }, [])

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

  const templates: Array<{
    value: AuthorShareImageKind
    title: string
    description: string
    enabled: boolean
    pro: boolean
    icon: typeof UserRound
  }> = [
    {
      value: "profile",
      title: "Presentación del autor",
      description: "Foto, nombre, estilo y portadas.",
      enabled: true,
      pro: false,
      icon: UserRound,
    },
    {
      value: "featured",
      title: "Libro destacado",
      description: hasFeaturedBook
        ? "Una pieza centrada en tu libro principal."
        : "Selecciona un libro destacado en el editor.",
      enabled: hasFeaturedBook,
      pro: false,
      icon: BookOpen,
    },
    {
      value: "news",
      title: "Novedad",
      description: !isPro
        ? "Plantilla disponible para autores PRO."
        : hasNews
          ? "Convierte tu novedad publicada en una pieza social."
          : "Publica una novedad para usar esta plantilla.",
      enabled: isPro && hasNews,
      pro: true,
      icon: Megaphone,
    },
  ]

  async function createImageFile() {
    const params = new URLSearchParams({
      authorId,
      kind,
      format,
    })
    const response = await fetch(`/api/authors/share-image?${params.toString()}`)

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(payload?.error || "No se pudo crear la imagen")
    }

    const blob = await response.blob()
    const filename = `autor-${authorSlug}-${kind}-${format}.png`

    return {
      blob,
      filename,
      file: new File([blob], filename, { type: "image/png" }),
    }
  }

  async function downloadImage() {
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
          : "No se pudo crear la imagen"
      )
    } finally {
      setActiveAction(null)
    }
  }

  async function shareImage() {
    setActiveAction("share")
    setError("")

    try {
      const { file } = await createImageFile()

      if (!navigator.canShare?.({ files: [file] })) {
        throw new Error("Este dispositivo no permite compartir archivos")
      }

      await navigator.share({
        files: [file],
        title: authorName,
        text: `Descubre a ${authorName} en Cas(z)a de Libros.`,
        url: `${window.location.origin}/authors/${authorSlug}`,
      })
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return
      }

      setError(
        shareError instanceof Error
          ? shareError.message
          : "No se pudo compartir la imagen"
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
        className="inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm text-white transition-all duration-150 active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        <ImageDown size={17} aria-hidden="true" />
        Crear imagen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
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
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 text-left text-white shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold">
                  Crear imagen promocional
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  Utilizaremos la información que ya está publicada en tu página.
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

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-zinc-300">
                Plantilla
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {templates.map((template) => {
                  const Icon = template.icon
                  const selected = kind === template.value

                  return (
                    <label
                      key={template.value}
                      className={`relative rounded-2xl border p-4 transition ${
                        template.enabled
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-55"
                      } ${
                        selected
                          ? "border-blue-400/60 bg-blue-500/10"
                          : "border-zinc-800 bg-zinc-900/70"
                      }`}
                    >
                      <input
                        type="radio"
                        name="author-share-template"
                        value={template.value}
                        checked={selected}
                        disabled={!template.enabled}
                        onChange={() => setKind(template.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                        {template.pro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-bold text-amber-300">
                            <Crown className="h-3 w-3" aria-hidden="true" />
                            PRO
                          </span>
                        )}
                      </div>
                      <span className="mt-3 block text-sm font-semibold text-zinc-100">
                        {template.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
                        {template.description}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-zinc-300">Formato</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {FORMATS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                      format === option.value
                        ? "border-blue-400/60 bg-blue-500/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="author-share-format"
                      value={option.value}
                      checked={format === option.value}
                      onChange={() => setFormat(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {option.dimensions}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs leading-relaxed text-zinc-400">
              {isPro
                ? "La imagen utilizará los colores y el banner de tu página cuando corresponda."
                : "La imagen utilizará el diseño oficial de Cas(z)a de Libros."}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={downloadImage}
                disabled={activeAction !== null}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                  supportsFileSharing
                    ? "border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {activeAction === "download" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {activeAction === "download" ? "Creando..." : "Descargar"}
              </button>

              {supportsFileSharing && (
                <button
                  type="button"
                  onClick={shareImage}
                  disabled={activeAction !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
                >
                  {activeAction === "share" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Share2 className="h-4 w-4" aria-hidden="true" />
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
          </section>
        </div>
      )}
    </>
  )
}
