"use client"

import { useRouter } from "next/navigation"

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition mb-6"
    >
      ← Regresar
    </button>
  )
}