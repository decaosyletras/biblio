/* eslint-disable @next/next/no-img-element -- ImageResponse requiere img para incrustar las imágenes procesadas. */
import type { ReactElement } from "react"
import {
  READER_SHARE_IMAGE_SIZES,
  type ReaderShareImageFormat,
} from "@/lib/readerShareImage"
import {
  SHARE_IMAGE_PALETTES,
  type ShareImageTheme,
} from "@/lib/shareImageThemes"

type BookRecommendationShareImageData = {
  title: string
  authors: string
  coverDataUrl: string | null
  displayName: string
  avatarDataUrl: string | null
  format: ReaderShareImageFormat
  theme: ShareImageTheme
}

export { READER_SHARE_IMAGE_SIZES }
export type { ReaderShareImageFormat }

export function renderBookRecommendationShareImage({
  title,
  authors,
  coverDataUrl,
  displayName,
  avatarDataUrl,
  format,
  theme,
}: BookRecommendationShareImageData): ReactElement {
  const isStory = format === "story"
  const coverWidth = isStory ? 500 : 350
  const coverHeight = isStory ? 750 : 525
  const avatarSize = isStory ? 92 : 72
  const titleSize = title.length > 55
    ? isStory ? 47 : 36
    : isStory ? 58 : 44
  const initial = displayName.trim().charAt(0).toUpperCase() || "L"
  const palette = SHARE_IMAGE_PALETTES[theme]

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: isStory ? "76px 74px" : "50px 62px",
        color: "#f4f4f5",
        background: palette.background,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: 999,
          background: palette.glowPrimary,
          left: -300,
          top: 330,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 430,
          height: 430,
          borderRadius: 999,
          background: palette.glowSecondary,
          right: -230,
          bottom: -180,
        }}
      />

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: isStory ? 30 : 24,
            fontWeight: 800,
            letterSpacing: 1.4,
          }}
        >
          CAS(<span style={{ color: "#ef4444" }}>Z</span>)A DE LIBROS
        </div>
        <div
          style={{
            display: "flex",
            color: palette.accent,
            fontSize: isStory ? 24 : 19,
            fontWeight: 700,
          }}
        >
          LITERATURA INDIE
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: isStory ? 70 : 38,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            color: palette.accent,
            fontSize: isStory ? 30 : 23,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Te recomiendo
        </div>
        <div
          style={{
            display: "flex",
            marginTop: isStory ? 20 : 12,
            color: "#ffffff",
            fontSize: isStory ? 74 : 54,
            fontWeight: 900,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          una lectura indie
        </div>
      </div>

      <div
        style={{
          width: coverWidth,
          height: coverHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: isStory ? 58 : 30,
          borderRadius: isStory ? 28 : 22,
          border: `3px solid ${palette.accentBorder}`,
          background: "#27272a",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.48)",
          position: "relative",
        }}
      >
        {coverDataUrl ? (
          <img
            src={coverDataUrl}
            alt=""
            width={coverWidth}
            height={coverHeight}
            style={{
              width: coverWidth,
              height: coverHeight,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 38,
              color: "#e4e4e7",
              fontSize: isStory ? 42 : 31,
              fontWeight: 800,
              lineHeight: 1.15,
              textAlign: "center",
              background: "linear-gradient(145deg, #27272a, #18181b)",
            }}
          >
            {title}
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: isStory ? 42 : 25,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            maxHeight: isStory ? 126 : 94,
            overflow: "hidden",
            color: "#ffffff",
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 1.08,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: isStory ? 18 : 12,
            color: "#a1a1aa",
            fontSize: isStory ? 29 : 22,
            textAlign: "center",
          }}
        >
          {authors}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: isStory ? 42 : 24,
          position: "relative",
        }}
      >
        {avatarDataUrl ? (
          <img
            src={avatarDataUrl}
            alt=""
            width={avatarSize}
            height={avatarSize}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: 999,
              border: `2px solid ${palette.accentBorder}`,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: `2px solid ${palette.accentBorder}`,
              background: "#27272a",
              color: palette.accent,
              fontSize: isStory ? 40 : 31,
              fontWeight: 800,
            }}
          >
            {initial}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: isStory ? 23 : 17,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#a1a1aa",
              fontSize: isStory ? 22 : 18,
            }}
          >
            Lo recomienda
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 5,
              color: "#f4f4f5",
              fontSize: isStory ? 31 : 24,
              fontWeight: 800,
            }}
          >
            {displayName}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: isStory ? 34 : 21,
          color: palette.accent,
          fontSize: isStory ? 23 : 18,
          fontWeight: 700,
          position: "relative",
        }}
      >
        Descúbrelo en Cas(z)a de Libros
      </div>
    </div>
  )
}
