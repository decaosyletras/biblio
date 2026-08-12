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
  const coverWidth = isStory ? 480 : 370
  const coverHeight = isStory ? 720 : 555
  const avatarSize = isStory ? 82 : 66
  const titleSize = title.length > 70
    ? isStory ? 40 : 31
    : title.length > 42
      ? isStory ? 48 : 37
      : isStory ? 58 : 44
  const displayNameSize = displayName.length > 24
    ? isStory ? 25 : 20
    : isStory ? 30 : 24
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
        padding: isStory ? "72px 76px 82px" : "50px 64px 58px",
        color: "#f4f4f5",
        background: palette.background,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: isStory ? 28 : 22,
          display: "flex",
          border: `2px solid ${palette.accentBorder}`,
          borderRadius: isStory ? 34 : 28,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: isStory ? 122 : 92,
          right: isStory ? 28 : 22,
          width: 8,
          height: isStory ? 210 : 160,
          display: "flex",
          borderRadius: 999,
          background: palette.accent,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isStory ? 620 : 520,
          height: isStory ? 620 : 520,
          borderRadius: 999,
          background: palette.glowPrimary,
          left: isStory ? -310 : -260,
          top: isStory ? 390 : 220,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: 999,
          background: palette.glowSecondary,
          right: -250,
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
            fontSize: isStory ? 32 : 27,
            fontWeight: 900,
            letterSpacing: 1.8,
          }}
        >
          CAS(<span style={{ color: "#ef4444" }}>Z</span>)A INDIE
        </div>
        <div
          style={{
            display: "flex",
            color: palette.accent,
            fontSize: isStory ? 22 : 18,
            fontWeight: 800,
            letterSpacing: 2.5,
          }}
        >
          RECOMENDACIÓN
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isStory ? "flex-start" : "center",
          flexGrow: 1,
          marginTop: isStory ? 74 : 32,
          paddingBottom: isStory ? 180 : 42,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: isStory ? "10px 22px" : "8px 18px",
            borderRadius: 999,
            border: `1px solid ${palette.accentBorder}`,
            background: "rgba(9,9,11,0.48)",
            color: palette.accent,
            fontSize: isStory ? 22 : 18,
            fontWeight: 900,
            letterSpacing: 3.5,
          }}
        >
          TE RECOMIENDO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: isStory ? 17 : 12,
            color: "#ffffff",
            fontSize: isStory ? 65 : 50,
            fontWeight: 900,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          una lectura indie
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: isStory ? 48 : 27,
            padding: isStory ? 14 : 11,
            borderRadius: isStory ? 29 : 23,
            border: `2px solid ${palette.accentBorder}`,
            background: "rgba(9,9,11,0.56)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.52)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: isStory ? 122 : 96,
              height: isStory ? 14 : 11,
              right: isStory ? -28 : -22,
              top: isStory ? 86 : 68,
              display: "flex",
              borderRadius: 999,
              background: palette.accent,
            }}
          />
          <div
            style={{
              width: coverWidth,
              height: coverHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: isStory ? 20 : 16,
              background: "#27272a",
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
                  fontSize: isStory ? 40 : 31,
                  fontWeight: 900,
                  lineHeight: 1.12,
                  textAlign: "center",
                  background: "linear-gradient(145deg, #27272a, #18181b)",
                }}
              >
                {title}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: isStory ? 900 : 850,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: isStory ? 38 : 23,
          }}
        >
          <div
            style={{
              display: "flex",
              maxHeight: isStory ? 120 : 88,
              overflow: "hidden",
              color: "#ffffff",
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.06,
              textAlign: "center",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: isStory ? 15 : 10,
              color: "#b4b4bc",
              fontSize: isStory ? 27 : 21,
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
            marginTop: isStory ? 35 : 22,
            padding: isStory ? "12px 25px 12px 13px" : "10px 20px 10px 11px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(9,9,11,0.62)",
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
                fontSize: isStory ? 34 : 27,
                fontWeight: 900,
              }}
            >
              {initial}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: isStory ? 19 : 15,
            }}
          >
            <div style={{ display: "flex", color: "#a1a1aa", fontSize: isStory ? 18 : 15, letterSpacing: 1.2 }}>
              RECOMENDADO POR
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: isStory ? 510 : 455,
                maxHeight: isStory ? 62 : 50,
                overflow: "hidden",
                marginTop: 4,
                color: "#f4f4f5",
                fontSize: displayNameSize,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              {displayName}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#a1a1aa",
          fontSize: isStory ? 22 : 18,
          position: "relative",
          marginBottom: isStory ? 120 : 0,
        }}
      >
        <div style={{ display: "flex" }}>Encuentra libros indie que sí quieres leer</div>
        <div style={{ display: "flex", color: palette.accent, fontWeight: 800 }}>
          cazaindie.com
        </div>
      </div>
    </div>
  )
}
