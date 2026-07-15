"use client"

import {
  generateAmazonLink,
  detectAmazonCountry
} from "@/lib/amazon"

export default function AmazonButton({
  amazon,
  amazonLink,
  color,
  textColor
}: {
  amazon: Record<string, string>
  amazonLink?: string
  color?: string,
  textColor?: string
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
        mt-2
        px-1 py-1
        rounded-xl
        font-semibold
        text-sm
        transition
        whitespace-nowrap
        hover:opacity-90
      "
      style={{
        backgroundColor: color ?? "#eab308",
        color: textColor ?? "#000000"
      }}
    >
      Ver en Amazon
    </button>
  )
}