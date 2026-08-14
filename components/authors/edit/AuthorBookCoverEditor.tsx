"use client"

import { useEffect, useId, useRef, useState } from "react"
import imageCompression from "browser-image-compression"
import { CheckCircle2, ImageUp } from "lucide-react"
import { getBookCover } from "@/lib/amazon"
import {
  BOOK_COVER_CONSENT_TEXT,
  BOOK_COVER_CONSENT_VERSION,
} from "@/lib/bookCoverConsent"
import type { BookCoverSource } from "@/types"

const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

type EditableBook = {
  id: string
  title: string
  cover?: string | null
  cover_source?: BookCoverSource | null
  asin_es?: string | null
  asin_mx?: string | null
  asin_us?: string | null
}

type CoverUpdate = {
  cover: string
  cover_source: BookCoverSource
  cover_storage_path: string
  cover_updated_at: string
}

function inferCoverSource(book: EditableBook): BookCoverSource {
  if (book.cover_source) return book.cover_source

  if ([book.asin_us, book.asin_es, book.asin_mx].some(
    (asin) => typeof asin === "string" && asin.trim()
  )) return "amazon"

  return book.cover?.trim() ? "legacy" : "generic"
}

function coverStatus(source: BookCoverSource) {
  switch (source) {
    case "author_upload":
      return { label: "Portada subida y autorizada", ready: true }
    case "admin_upload":
      return { label: "Portada verificada por Caza Indie", ready: true }
    case "legacy":
      return { label: "Portada anterior pendiente de verificar", ready: false }
    case "amazon":
      return { label: "Portada temporal obtenida con el ASIN", ready: false }
    default:
      return { label: "Portada genérica", ready: false }
  }
}

export default function AuthorBookCoverEditor({
  authorId,
  book,
  onUpdated,
}: {
  authorId: string
  book: EditableBook
  onUpdated: (bookId: string, updates: CoverUpdate) => void
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [authorized, setAuthorized] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const source = inferCoverSource(book)
  const status = coverStatus(source)
  const currentCover = getBookCover(
    {
      es: book.asin_es ?? "",
      mx: book.asin_mx ?? "",
      us: book.asin_us ?? "",
    },
    book.cover ?? "",
    source
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function selectFile(selectedFile: File | null) {
    setError("")
    setNotice("")
    setAuthorized(false)

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (!selectedFile) {
      setFile(null)
      setPreviewUrl("")
      return
    }

    if (!ALLOWED_TYPES.has(selectedFile.type)) {
      setFile(null)
      setPreviewUrl("")
      setError("Usa una imagen JPG, PNG o WebP.")
      return
    }

    if (selectedFile.size > MAX_ORIGINAL_BYTES) {
      setFile(null)
      setPreviewUrl("")
      setError("La imagen original no puede superar 10 MB.")
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  async function uploadCover() {
    if (!file || !authorized || uploading) return

    setUploading(true)
    setError("")
    setNotice("")

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1800,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.82,
      })
      const formData = new FormData()

      formData.set("bookId", book.id)
      formData.set("authorId", authorId)
      formData.set("consentVersion", BOOK_COVER_CONSENT_VERSION)
      formData.set("rightsConfirmed", "true")
      formData.set("cover", compressed, `${book.id}.webp`)

      const response = await fetch("/api/authors/books/cover", {
        method: "POST",
        body: formData,
      })
      const result = await response.json().catch(() => null) as {
        error?: string
        cover?: string
        coverSource?: BookCoverSource
        coverStoragePath?: string
        coverUpdatedAt?: string
      } | null

      if (
        !response.ok ||
        !result?.cover ||
        result.coverSource !== "author_upload" ||
        !result.coverStoragePath ||
        !result.coverUpdatedAt
      ) {
        throw new Error(result?.error ?? "No se pudo actualizar la portada")
      }

      onUpdated(book.id, {
        cover: result.cover,
        cover_source: result.coverSource,
        cover_storage_path: result.coverStoragePath,
        cover_updated_at: result.coverUpdatedAt,
      })
      setFile(null)
      setAuthorized(false)
      setPreviewUrl("")
      if (inputRef.current) inputRef.current.value = ""
      setNotice("Portada optimizada, guardada y autorizada correctamente.")
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo actualizar la portada"
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
          {/* Las portadas pueden venir temporalmente de Amazon o de Supabase. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl || currentCover}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-100">{book.title}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              status.ready ? "text-green-300" : "text-yellow-300"
            }`}
          >
            {status.label}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              <ImageUp size={17} aria-hidden="true" />
              {file ? "Elegir otra imagen" : status.ready ? "Sustituir portada" : "Subir portada"}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            />
            <span className="text-xs text-zinc-500">
              JPG, PNG o WebP · máximo 10 MB
            </span>
          </div>

          {file && (
            <div className="mt-4 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-zinc-300">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(event) => setAuthorized(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
                />
                <span>
                  {BOOK_COVER_CONSENT_TEXT}
                </span>
              </label>

              <button
                type="button"
                disabled={!authorized || uploading}
                onClick={uploadCover}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} aria-hidden="true" />
                {uploading ? "Optimizando y guardando..." : "Guardar esta portada"}
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mt-3 text-xs text-green-300">
              {notice}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
