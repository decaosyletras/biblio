export type AvatarCopySource = "author" | "reader"

const EXTENSIONS_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function fetchAvatarCopy(
  source: AvatarCopySource
): Promise<File> {
  const response = await fetch(`/api/profile-avatar-copy?source=${source}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const result = await response.json().catch(() => null) as {
      error?: string
    } | null

    throw new Error(result?.error ?? "No se pudo importar la foto")
  }

  const blob = await response.blob()
  const extension = EXTENSIONS_BY_TYPE[blob.type]

  if (!extension) {
    throw new Error("La foto no tiene un formato compatible")
  }

  return new File([blob], `avatar-importado.${extension}`, {
    type: blob.type,
  })
}
