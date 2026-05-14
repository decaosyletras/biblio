const affiliateTags = {
  es: "casaindie-21",
  us: "casaindie-20",
}

export function getAmazonStore(country: string) {

  const c = country.toUpperCase()

  switch (c) {

    case "ES":
      return {
        domain: "amazon.es",
        tag: affiliateTags.es,
        asinKey: "es",
      }

    // 👇 TODO lo demás usa USA
    default:
      return {
        domain: "amazon.com",
        tag: affiliateTags.us,
        asinKey: "us",
      }
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
  const store = getAmazonStore(country)

  const asin = getBookAsin(amazon, country)

  // 👇 si NO hay asin, usa link manual
  if (!asin) {
    return fallbackUrl || "https://amazon.com"
  }

  const baseUrl = `https://${store.domain}/dp/${asin}`

  if (store.tag && store.tag.length > 0) {
    return `${baseUrl}?tag=${store.tag}`
  }

  return baseUrl
}

export function getAmazonCover(
  amazon: Record<string, string>
) {

  const asin =
    amazon.us ||
    amazon.es ||
    amazon.mx ||
    Object.values(amazon)[0]

  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
}

export function getBookCover(
  amazon: Record<string, string>,
  localCover?: string
) {
  const asin =
    amazon.us ||
    amazon.es ||
    amazon.mx ||
    Object.values(amazon)[0]

  // 1. Amazon cover si hay ASIN
  if (asin) {
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
  }

  // 2. Cover local del libro
  if (localCover && localCover.trim() !== "") {
    return localCover
  }

  // 3. fallback final
  return "/covers/portadagenerica.png"
}
