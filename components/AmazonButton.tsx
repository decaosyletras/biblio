"use client"

import { generateAmazonLink } from "@/lib/amazon"

export default function AmazonButton({
  amazon,
}: {
  amazon: Record<string, string>
}) {
  const handleClick = () => {
    let country = "US"
    const lang = navigator.language.toLowerCase()

    if (lang.includes("es-es")) {
      country = "ES"
    }

    const url = generateAmazonLink(amazon, country)

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobile) {
      // ✔️ móvil: navegación directa (evita problemas de back stack)
      window.location.href = url
    } else {
      // ✔️ desktop: nueva pestaña normal
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="
        mt-4
        bg-yellow-500
        hover:bg-yellow-400
        text-black
        px-3 py-1.5
        rounded-full
        font-medium
        text-sm
        transition
        whitespace-nowrap
      "
    >
      Ver en Amazon
    </button>
  )
}