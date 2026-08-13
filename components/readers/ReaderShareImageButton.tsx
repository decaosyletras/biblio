"use client"

import { useEffect, useState } from "react"
import { Download, ImageDown, LoaderCircle, Share2 } from "lucide-react"
import ShareImageThemePicker from "@/components/readers/ShareImageThemePicker"
import {
  SHARE_IMAGE_THEME_STORAGE_KEY,
  isShareImageTheme,
  type ShareImageTheme,
} from "@/lib/shareImageThemes"
import { notifyReaderAchievementsChanged } from "@/lib/readerAchievementEvents"

type ShareImageFormat = "story" | "post"

const formats: Array<{
  value: ShareImageFormat
  label: string
  dimensions: string
}> = [
  { value: "story", label: "Historia", dimensions: "1080 × 1920" },
  { value: "post", label: "Publicación vertical", dimensions: "1080 × 1350" },
]

export default function ReaderShareImageButton() {
  const [selectedFormat, setSelectedFormat] =
    useState<ShareImageFormat>("story")
  const [selectedTheme, setSelectedTheme] =
    useState<ShareImageTheme>("nocturnal")
  const [activeAction, setActiveAction] = useState<"download" | "share" | null>(
    null
  )
  const [supportsFileSharing, setSupportsFileSharing] = useState(false)
  const [preparedShareFile, setPreparedShareFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof navigator.share !== "function" || !navigator.canShare) return

    const sampleFile = new File(["share"], "biblioteca.png", {
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
    setPreparedShareFile(null)
    try {
      window.localStorage.setItem(SHARE_IMAGE_THEME_STORAGE_KEY, theme)
    } catch {
      // La preferencia simplemente no se recordará en este navegador.
    }
  }

  const createImageFile = async () => {
    const response = await fetch(
      `/api/readers/share-image?format=${selectedFormat}&theme=${selectedTheme}`
    )

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(payload?.error || "No se pudo crear la imagen")
    }

    const blob = await response.blob()
    notifyReaderAchievementsChanged()
    const filename = `mi-biblioteca-indie-${selectedFormat}.png`

    return {
      blob,
      filename,
      file: new File([blob], filename, { type: "image/png" }),
    }
  }

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
          : "No se pudo crear la imagen"
      )
    } finally {
      setActiveAction(null)
    }
  }

  const prepareShareImage = async () => {
    setActiveAction("share")
    setError("")

    try {
      const { file } = await createImageFile()

      if (!navigator.canShare?.({ files: [file] })) {
        throw new Error(
          "Este dispositivo no permite compartir la imagen directamente"
        )
      }

      setPreparedShareFile(file)
    } catch (shareError) {
      setError(
        shareError instanceof Error
          ? shareError.message
          : "No se pudo preparar la imagen"
      )
    } finally {
      setActiveAction(null)
    }
  }

  const sharePreparedImage = async () => {
    if (!preparedShareFile) return

    setActiveAction("share")
    setError("")

    try {
      // La llamada debe ocurrir directamente dentro de este segundo clic. Si se
      // genera el archivo aquí, el navegador pierde la activación del usuario.
      const shareRequest = navigator.share({
        files: [preparedShareFile],
        title: "Mi biblioteca indie",
        text: "Mi biblioteca indie en Cas(z)a Indie",
      })

      await shareRequest
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
    <section className="mt-5 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/70 via-zinc-900 to-zinc-900 p-4 sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <ImageDown size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">
              Comparte tu biblioteca indie
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-400">
              Descarga una imagen personalizada con tus libros más recientes y
              tus estadísticas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-zinc-400">
              Formato
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((format) => (
                <label
                  key={format.value}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-left transition ${
                    selectedFormat === format.value
                      ? "border-yellow-400/60 bg-yellow-400/10"
                      : "border-zinc-700 bg-zinc-950/40 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="share-image-format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={() => {
                      setSelectedFormat(format.value)
                      setPreparedShareFile(null)
                    }}
                    className="sr-only"
                  />
                  <span className="block whitespace-nowrap text-xs font-semibold text-zinc-100 sm:text-sm">
                    {format.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500 sm:text-xs">
                    {format.dimensions}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <ShareImageThemePicker
            name="library-share-image-theme"
            value={selectedTheme}
            onChange={selectTheme}
          />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={downloadImage}
              disabled={activeAction !== null}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
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
                onClick={
                  preparedShareFile
                    ? sharePreparedImage
                    : prepareShareImage
                }
                disabled={activeAction !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-wait disabled:opacity-60"
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
                {activeAction === "share"
                  ? preparedShareFile
                    ? "Abriendo..."
                    : "Preparando..."
                  : preparedShareFile
                    ? "Compartir ahora"
                    : "Preparar para compartir"}
              </button>
            )}
          </div>
          {supportsFileSharing && preparedShareFile && (
            <p className="text-right text-xs text-green-300" role="status">
              Imagen lista. Pulsa “Compartir ahora” para abrir las opciones de tu dispositivo.
            </p>
          )}
        </div>
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
  )
}
