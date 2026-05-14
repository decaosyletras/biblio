"use client"

import { generateAmazonLink }
from "@/lib/amazon"

export default function AmazonButton({
  amazon
}: {
  amazon: Record<string, string>
}) {

  let country = "US"

  if (typeof navigator !== "undefined") {
    const lang =
      navigator.language.toLowerCase()

    if (lang.includes("es-es")) {
      country = "ES"
    }
  }

  const url =
    generateAmazonLink(
      amazon,
      country
    )

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-block
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
    </a>
  )
}