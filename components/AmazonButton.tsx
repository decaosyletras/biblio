"use client"

import {
  generateAmazonLink,
  detectAmazonCountry
} from "@/lib/amazon"

export default function AmazonButton({
  amazon,
  amazonLink
}: {
  amazon: Record<string, string>
  amazonLink?: string
}) {

  const handleClick = async () => {

    const country =
      await detectAmazonCountry()

    const url = generateAmazonLink(
      amazon,
      country,
      amazonLink
    )

    window.open(url, "_blank")
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