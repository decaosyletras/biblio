"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

export default function ShareProfileButton({
  path,
  backgroundColor,
  textColor = "#ffffff",
  compact = false,
  iconOnly = false,
}: {
  path: string
  backgroundColor: string
  textColor?: string
  compact?: boolean
  iconOnly?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  async function copyProfileLink() {
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
      onClick={copyProfileLink}
      aria-label={failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir perfil"}
      aria-live="polite"
      title={failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir"}
      className={`inline-flex items-center justify-center whitespace-nowrap font-medium shadow-lg transition-all duration-150 active:scale-95 ${
        iconOnly
          ? "h-10 w-12 rounded-xl text-sm"
          : compact
            ? "w-fit gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
            : "w-fit gap-2 rounded-lg px-4 py-2.5 text-sm"
      }`}
      style={{ backgroundColor, color: textColor }}
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
