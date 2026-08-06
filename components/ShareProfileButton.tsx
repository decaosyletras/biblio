"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

export default function ShareProfileButton({
  path,
  backgroundColor,
  textColor = "#ffffff",
  compact = false,
}: {
  path: string
  backgroundColor: string
  textColor?: string
  compact?: boolean
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
      aria-live="polite"
      className={`inline-flex w-fit items-center justify-center whitespace-nowrap font-medium transition-all duration-150 active:scale-95 ${
        compact
          ? "gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          : "gap-2 rounded-lg px-4 py-2.5 text-sm"
      }`}
      style={{ backgroundColor, color: textColor }}
    >
      {copied ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Share2 size={16} aria-hidden="true" />
      )}
      {failed ? "No se pudo copiar" : copied ? "Liga copiada" : "Compartir"}
    </button>
  )
}
