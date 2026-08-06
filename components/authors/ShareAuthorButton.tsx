"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

export default function ShareAuthorButton({
  path,
  backgroundColor,
  iconOnly = false,
}: {
  path: string
  backgroundColor: string
  iconOnly?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  async function copyAuthorLink() {
    const url = new URL(path, window.location.origin).toString()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setFailed(false)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setFailed(true)
    }
  }

  return (
    <button
      type="button"
      onClick={copyAuthorLink}
      aria-label={failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir perfil"}
      aria-live="polite"
      title={failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir"}
      className={`inline-flex items-center justify-center whitespace-nowrap text-sm text-white shadow-lg transition-all duration-150 active:scale-95 ${
        iconOnly
          ? "h-10 w-12 rounded-xl"
          : "w-fit gap-2 rounded-lg px-4 py-2.5"
      }`}
      style={{ backgroundColor }}
    >
      {copied ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Share2 size={16} aria-hidden="true" />
      )}
      {!iconOnly && (
        failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir"
      )}
    </button>
  )
}
