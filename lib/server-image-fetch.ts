import "server-only"

import sharp from "sharp"

const ALLOWED_SUPABASE_BUCKETS = new Set([
  "authors",
  "book-covers",
  "reader-avatars",
])
const ALLOWED_AMAZON_IMAGE_HOSTS = new Set([
  "images-na.ssl-images-amazon.com",
  "images.amazon.com",
  "m.media-amazon.com",
])
const ALLOWED_SITE_PATH_PREFIXES = ["/authors/", "/covers/"]
const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
])
const SAFE_SITE_IMAGE_EXTENSION = /\.(?:avif|jpe?g|png|webp)$/i
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_PIXELS = 40_000_000
const MAX_REDIRECTS = 2
const FETCH_TIMEOUT_MS = 8_000

type SupabaseImageRule = {
  bucket: string
  pathPrefix?: string
}

type TrustedImageOptions = {
  siteOrigin: string
}

function parseUrl(value: string) {
  try {
    const url = new URL(value)

    if (url.username || url.password) return null

    return url
  } catch {
    return null
  }
}

function getSupabaseOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!configuredUrl) return null

  return parseUrl(configuredUrl)?.origin ?? null
}

function getTrustedSiteOrigins(siteOrigin: string) {
  const origins = new Set<string>()

  for (const configuredUrl of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ]) {
    if (!configuredUrl) continue

    const origin = parseUrl(configuredUrl)?.origin
    if (origin) origins.add(origin)
  }

  // El servidor de desarrollo necesita leer las imágenes de public mediante
  // localhost. En producción nunca se confía en el Host recibido del cliente.
  if (process.env.NODE_ENV !== "production") {
    const localSite = parseUrl(siteOrigin)

    if (
      localSite &&
      (localSite.hostname === "localhost" || localSite.hostname === "127.0.0.1")
    ) {
      origins.add(localSite.origin)
    }
  }

  return origins
}

function parseSupabasePublicObjectUrl(value: string) {
  const url = parseUrl(value)
  const expectedOrigin = getSupabaseOrigin()
  const storagePrefix = "/storage/v1/object/public/"

  if (
    !url ||
    !expectedOrigin ||
    url.origin !== expectedOrigin ||
    !url.pathname.startsWith(storagePrefix)
  ) {
    return null
  }

  const encodedParts = url.pathname.slice(storagePrefix.length).split("/")

  try {
    const bucket = decodeURIComponent(encodedParts.shift() ?? "")
    const path = encodedParts
      .map(part => decodeURIComponent(part))
      .join("/")

    if (!bucket || !path) return null

    return { bucket, path }
  } catch {
    return null
  }
}

export function isSupabasePublicImageUrl(
  value: string,
  rule: SupabaseImageRule
) {
  const storedObject = parseSupabasePublicObjectUrl(value)

  if (!storedObject || storedObject.bucket !== rule.bucket) return false

  return !rule.pathPrefix || storedObject.path.startsWith(rule.pathPrefix)
}

function isTrustedImageUrl(url: URL, siteOrigin: string) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false

  const storedObject = parseSupabasePublicObjectUrl(url.toString())
  if (storedObject) {
    return ALLOWED_SUPABASE_BUCKETS.has(storedObject.bucket)
  }

  if (
    url.protocol === "https:" &&
    ALLOWED_AMAZON_IMAGE_HOSTS.has(url.hostname.toLowerCase())
  ) {
    return true
  }

  return getTrustedSiteOrigins(siteOrigin).has(url.origin) &&
    ALLOWED_SITE_PATH_PREFIXES.some(prefix => url.pathname.startsWith(prefix)) &&
    SAFE_SITE_IMAGE_EXTENSION.test(url.pathname)
}

async function cancelBody(response: Response) {
  try {
    await response.body?.cancel()
  } catch {
    // La respuesta ya puede estar cerrada; no hay nada más que liberar.
  }
}

async function fetchFollowingTrustedRedirects(
  initialUrl: URL,
  options: TrustedImageOptions,
  signal: AbortSignal
) {
  let currentUrl = initialUrl

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!isTrustedImageUrl(currentUrl, options.siteOrigin)) return null

    const response = await fetch(currentUrl, {
      cache: "force-cache",
      redirect: "manual",
      signal,
    })

    if (response.status < 300 || response.status >= 400) {
      return response
    }

    const location = response.headers.get("location")
    await cancelBody(response)

    if (!location || redirectCount === MAX_REDIRECTS) return null

    try {
      currentUrl = new URL(location, currentUrl)
    } catch {
      return null
    }
  }

  return null
}

async function readLimitedBody(response: Response) {
  const declaredLength = response.headers.get("content-length")

  if (declaredLength) {
    const parsedLength = Number(declaredLength)

    if (
      !Number.isFinite(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > MAX_IMAGE_BYTES
    ) {
      await cancelBody(response)
      return null
    }
  }

  if (!response.body) return null

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength

      if (totalBytes > MAX_IMAGE_BYTES) {
        await reader.cancel()
        return null
      }

      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(
    chunks.map(chunk => Buffer.from(chunk)),
    totalBytes
  )
}

export async function fetchTrustedImageDataUrl(
  value: string,
  options: TrustedImageOptions
) {
  const initialUrl = parseUrl(value)
  if (!initialUrl || !isTrustedImageUrl(initialUrl, options.siteOrigin)) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetchFollowingTrustedRedirects(
      initialUrl,
      options,
      controller.signal
    )

    if (!response || !response.ok) {
      if (response) await cancelBody(response)
      return null
    }

    const normalizedType = (response.headers.get("content-type") ?? "")
      .split(";", 1)[0]
      .trim()
      .toLowerCase()

    if (!ALLOWED_CONTENT_TYPES.has(normalizedType)) {
      await cancelBody(response)
      return null
    }

    const bytes = await readLimitedBody(response)
    if (!bytes || bytes.byteLength === 0) return null

    const metadata = await sharp(bytes, {
      animated: false,
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).metadata()

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > MAX_IMAGE_PIXELS
    ) {
      return null
    }

    if (normalizedType === "image/png" || normalizedType === "image/jpeg") {
      return `data:${normalizedType};base64,${bytes.toString("base64")}`
    }

    const png = await sharp(bytes, {
      animated: false,
      limitInputPixels: MAX_IMAGE_PIXELS,
    })
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9 })
      .toBuffer()

    if (png.byteLength > MAX_IMAGE_BYTES) return null

    return `data:image/png;base64,${png.toString("base64")}`
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
