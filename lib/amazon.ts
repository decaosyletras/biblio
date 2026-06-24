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

/**
 * 🔥 NUEVO: detección segura (sin romper compatibilidad)
 */
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

  const asin =
    amazon[store.asinKey] ||
    amazon.us ||
    amazon.es ||
    amazon.mx

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

  if (!asin) {
    return fallbackUrl || "https://amazon.com"
  }

  const baseUrl = `https://${store.domain}/dp/${asin}`

  return `${baseUrl}?tag=${store.tag}`
}

/* =========================================================
   🔥 TODAS TUS FUNCIONES ORIGINALES (RESTORED / NO BORRADAS)
   ========================================================= */

// 👇 NO quitar porque ya lo usas
export function getAmazonCover(
  amazon: Record<string, string>,
  localCover?: string
) {
  // Buscar primer ASIN válido (no vacío)
  const asin = [
    amazon.us,
    amazon.es,
    amazon.mx,
    ...Object.values(amazon),
  ].find(
    (value) =>
      typeof value === "string" &&
      value.trim() !== ""
  )

  // 1. Portada de Amazon si hay ASIN válido
  if (asin) {
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
  }

  // 2. Cover local si existe
  if (
    typeof localCover === "string" &&
    localCover.trim() !== ""
  ) {
    return localCover
  }

  // 3. Fallback genérico
  return "/covers/portadagenerica.png"
}

export function getBookCover(
  amazon: Record<string, string>,
  localCover?: string
) {
  // Buscar primer ASIN válido (no vacío)
  const asin = [
    amazon.us,
    amazon.es,
    amazon.mx,
    ...Object.values(amazon),
  ].find(
    (value) =>
      typeof value === "string" &&
      value.trim() !== ""
  )

  // 1. Portada de Amazon si hay ASIN válido
  if (asin) {
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
  }

  // 2. Cover local si existe
  if (
    typeof localCover === "string" &&
    localCover.trim() !== ""
  ) {
    return localCover
  }

  // 3. Fallback genérico
  return "/covers/portadagenerica.png"
}