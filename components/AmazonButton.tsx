import { generateAmazonLink } from "@/lib/amazon"

export default function AmazonButton({
  amazon,
}: {
  amazon: Record<string, string>
}) {
  let country = "US"
  const lang = navigator.language.toLowerCase()

  if (lang.includes("es-es")) {
    country = "ES"
  }

  const url = generateAmazonLink(amazon, country)

  return (
    <a
      href={url}
      target="_self"
      rel="noopener noreferrer"
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
        inline-block
        whitespace-nowrap
      "
    >
      Ver en Amazon
    </a>
  )
}