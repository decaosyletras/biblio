export const SHARE_IMAGE_THEME_STORAGE_KEY = "casza-share-image-theme"

export const SHARE_IMAGE_THEMES = [
  { value: "nocturnal", label: "Nocturno", swatch: "#2563eb" },
  { value: "emerald", label: "Esmeralda", swatch: "#22c55e" },
  { value: "violet", label: "Violeta", swatch: "#a855f7" },
  { value: "warm", label: "Cálido", swatch: "#f97316" },
] as const

export type ShareImageTheme = (typeof SHARE_IMAGE_THEMES)[number]["value"]

type ShareImagePalette = {
  background: string
  glowPrimary: string
  glowSecondary: string
  accent: string
  accentBorder: string
}

export const SHARE_IMAGE_PALETTES: Record<
  ShareImageTheme,
  ShareImagePalette
> = {
  nocturnal: {
    background:
      "linear-gradient(145deg, #07152d 0%, #0f1f3c 38%, #18181b 70%, #09090b 100%)",
    glowPrimary: "rgba(37, 99, 235, 0.22)",
    glowSecondary: "rgba(250, 204, 21, 0.1)",
    accent: "#facc15",
    accentBorder: "rgba(250, 204, 21, 0.42)",
  },
  emerald: {
    background:
      "linear-gradient(150deg, #052e2b 0%, #0f2828 30%, #111827 66%, #09090b 100%)",
    glowPrimary: "rgba(34, 197, 94, 0.16)",
    glowSecondary: "rgba(250, 204, 21, 0.08)",
    accent: "#86efac",
    accentBorder: "rgba(134, 239, 172, 0.48)",
  },
  violet: {
    background:
      "linear-gradient(145deg, #24103f 0%, #31205c 36%, #181827 70%, #09090b 100%)",
    glowPrimary: "rgba(168, 85, 247, 0.2)",
    glowSecondary: "rgba(236, 72, 153, 0.1)",
    accent: "#d8b4fe",
    accentBorder: "rgba(216, 180, 254, 0.48)",
  },
  warm: {
    background:
      "linear-gradient(145deg, #431c16 0%, #3a2119 36%, #21191b 70%, #0c0a09 100%)",
    glowPrimary: "rgba(249, 115, 22, 0.2)",
    glowSecondary: "rgba(250, 204, 21, 0.1)",
    accent: "#fdba74",
    accentBorder: "rgba(253, 186, 116, 0.5)",
  },
}

export function isShareImageTheme(value: unknown): value is ShareImageTheme {
  return SHARE_IMAGE_THEMES.some((theme) => theme.value === value)
}
