"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function FloatingBack() {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 100)
    }

    handleScroll() // inicial
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  if (pathname === "/") return null

  return (
    <button
      onClick={handleBack}
      className={`
        fixed bottom-6 left-6 z-50
        w-10 h-10 rounded-full
        bg-zinc-800/80 backdrop-blur
        text-white flex items-center justify-center
        hover:bg-zinc-700 transition
        shadow-lg
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      ←
    </button>
  )
}