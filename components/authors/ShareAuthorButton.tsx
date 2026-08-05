"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

export default function ShareAuthorButton({
  path,
  backgroundColor,
}: {
  path: string
  backgroundColor: string
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
      aria-live="polite"
      className="inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm text-white transition-all duration-150 active:scale-95"
      style={{ backgroundColor }}
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
