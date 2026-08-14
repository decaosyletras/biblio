import type { BookCoverSource } from "@/types"

const affiliateTags = {
  ES: "casaindie-21",
  US: "casaindie-20",
}

export function getAmazonStore(country: string = "US") {
  const c = country.toUpperCase()

  switch (c) {
    case "ES":
      return {
        domain: "amazon.es",
        tag: affiliateTags.ES,
        asinKey: "es",
      }

    case "MX":
      return {
        domain: "amazon.com.mx",
        tag: null,
        asinKey: "mx",
      }

    default:
      return {
        domain: "amazon.com",
        tag: affiliateTags.US,
        asinKey: "us",
      }
  }
}

export async function detectAmazonCountry() {
  try {
    const res = await fetch("/api/country")
    const data = await res.json()

    return data.country || "US"
  } catch {
    return "US"
  }
}

export function getBookAsin(
  amazon: Record<string, string>,
  country: string
) {
  const store = getAmazonStore(country)
  const asin = amazon[store.asinKey] || amazon.us || amazon.es || amazon.mx

  return asin || undefined
}

export function generateAmazonLink(
  amazon: Record<string, string>,
  country: string,
  fallbackUrl?: string
) {
  const safeCountry = country || "US"
  const store = getAmazonStore(safeCountry)
  const asin = getBookAsin(amazon, country)

  if (!asin) return fallbackUrl || "https://amazon.com"

  const baseUrl = `https://${store.domain}/dp/${asin}`

  return store.tag ? `${baseUrl}?tag=${store.tag}` : baseUrl
}

function findAsin(amazon: Record<string, string>) {
  return [amazon.us, amazon.es, amazon.mx, ...Object.values(amazon)].find(
    (value) => typeof value === "string" && value.trim() !== ""
  )
}

export function getBookCover(
  amazon: Record<string, string>,
  localCover?: string,
  coverSource?: BookCoverSource
) {
  const asin = findAsin(amazon)
  const safeLocalCover =
    typeof localCover === "string" ? localCover.trim() : ""

  // Antes de aplicar la migracion se conserva exactamente el orden historico.
  if (!coverSource) {
    if (asin) {
      return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
    }

    return safeLocalCover || "/covers/portadagenerica.png"
  }

  if (
    (coverSource === "author_upload" ||
      coverSource === "admin_upload" ||
      coverSource === "legacy") &&
    safeLocalCover
  ) {
    return safeLocalCover
  }

  if (coverSource === "amazon" && asin) {
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
  }

  return "/covers/portadagenerica.png"
}

// Alias conservado para no romper importaciones historicas.
export function getAmazonCover(
  amazon: Record<string, string>,
  localCover?: string,
  coverSource?: BookCoverSource
) {
  return getBookCover(amazon, localCover, coverSource)
}
