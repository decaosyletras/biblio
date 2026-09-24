/* eslint-disable @next/next/no-img-element -- ImageResponse necesita elementos img para incrustar los datos binarios. */
import type { ReactElement } from "react"
import {
  SHARE_IMAGE_PALETTES,
  type ShareImageTheme,
} from "@/lib/shareImageThemes"

export type ReaderShareImageFormat = "story" | "post"

type ShareBook = {
  title: string
  coverDataUrl: string | null
}

type ReaderShareImageData = {
  displayName: string
  avatarDataUrl: string | null
  totalBooks: number
  readBooks: number
  books: ShareBook[]
  format: ReaderShareImageFormat
  theme: ShareImageTheme
}

export const READER_SHARE_IMAGE_SIZES: Record<
  ReaderShareImageFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
}

function getCoverLayout(bookCount: number, isStory: boolean) {
  if (isStory) {
    if (bookCount === 1) return { width: 430, height: 645, gap: 0 }
    if (bookCount === 2) return { width: 350, height: 525, gap: 30 }
    if (bookCount === 3) return { width: 285, height: 428, gap: 24 }
    return { width: 255, height: 383, gap: 22 }
  }

  if (bookCount === 1) return { width: 330, height: 495, gap: 0 }
  if (bookCount === 2) return { width: 270, height: 405, gap: 28 }
  if (bookCount === 3) return { width: 220, height: 330, gap: 22 }
  return { width: 198, height: 297, gap: 18 }
}

export function renderReaderShareImage({
  displayName,
  avatarDataUrl,
  totalBooks,
  readBooks,
  books,
  format,
  theme,
}: ReaderShareImageData): ReactElement {
  const isStory = format === "story"
  const avatarSize = isStory ? 112 : 88
  const initial = displayName.trim().charAt(0).toUpperCase() || "L"
  const palette = SHARE_IMAGE_PALETTES[theme]
  const coverLayout = getCoverLayout(books.length, isStory)
  const displayNameSize = displayName.length > 24
    ? isStory ? 38 : 31
    : isStory ? 46 : 37

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        color: "#f4f4f5",
        background: palette.background,
        padding: isStory ? "72px 76px 82px" : "50px 64px 58px",
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
          width: isStory ? 690 : 560,
          height: isStory ? 690 : 560,
          borderRadius: 999,
          background: palette.glowPrimary,
          left: isStory ? -340 : -290,
          top: isStory ? 300 : 130,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 999,
          background: palette.glowSecondary,
          right: -260,
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
            alignItems: "center",
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
          PERFIL LECTOR
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          marginTop: isStory ? 72 : 42,
          position: "relative",
        }}
      >
        <div
          style={{
            width: avatarSize + 18,
            height: avatarSize + 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: isStory ? 34 : 28,
            background: `linear-gradient(145deg, ${palette.accentBorder}, rgba(255,255,255,0.05))`,
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
                borderRadius: isStory ? 27 : 22,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: isStory ? 27 : 22,
                background: "#18181b",
                color: palette.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isStory ? 52 : 41,
                fontWeight: 900,
              }}
            >
              {initial}
            </div>
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            marginLeft: isStory ? 30 : 24,
          }}
        >
          <div
            style={{
              display: "flex",
              color: palette.accent,
              fontSize: isStory ? 20 : 17,
              fontWeight: 800,
              letterSpacing: 2.5,
            }}
          >
            LA BIBLIOTECA DE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 7,
              maxWidth: isStory ? 700 : 760,
              maxHeight: isStory ? 106 : 85,
              overflow: "hidden",
              fontSize: displayNameSize,
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            {displayName}
          </div>
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
          marginTop: isStory ? 76 : 36,
          paddingBottom: isStory ? 185 : 54,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: isStory ? 67 : 52,
            fontWeight: 900,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          Mi biblioteca indie
        </div>
        <div
          style={{
            display: "flex",
            marginTop: isStory ? 18 : 13,
            color: "#a1a1aa",
            fontSize: isStory ? 25 : 20,
            textAlign: "center",
          }}
        >
          Historias independientes que forman parte de mí
        </div>

        <div
          style={{
            width: isStory && books.length === 4 ? 550 : "100%",
            display: "flex",
            flexWrap: isStory && books.length === 4 ? "wrap" : "nowrap",
            alignItems: "center",
            justifyContent: "center",
            gap: coverLayout.gap,
            marginTop: isStory ? 50 : 30,
          }}
        >
          {books.map((book, index) => (
            <div
              key={`${book.title}-${index}`}
              style={{
                width: coverLayout.width,
                height: coverLayout.height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                borderRadius: isStory ? 24 : 19,
                border: "2px solid rgba(255,255,255,0.18)",
                background: "#27272a",
                boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
              }}
            >
              {book.coverDataUrl ? (
                <img
                  src={book.coverDataUrl}
                  alt=""
                  width={coverLayout.width}
                  height={coverLayout.height}
                  style={{
                    width: coverLayout.width,
                    height: coverLayout.height,
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
                    padding: 28,
                    color: "#e4e4e7",
                    fontSize: isStory ? 27 : 21,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    textAlign: "center",
                    background: "linear-gradient(145deg, #27272a, #18181b)",
                  }}
                >
                  {book.title}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            gap: isStory ? 22 : 17,
            marginTop: isStory ? 46 : 30,
          }}
        >
          <div
            style={{
              minWidth: isStory ? 225 : 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: isStory ? "18px 30px" : "14px 26px",
              borderRadius: isStory ? 22 : 18,
              border: "1px solid rgba(255,255,255,0.13)",
              background: "rgba(9,9,11,0.62)",
            }}
          >
            <div style={{ display: "flex", color: palette.accent, fontSize: isStory ? 38 : 31, fontWeight: 900 }}>
              {totalBooks}
            </div>
            <div style={{ display: "flex", marginTop: 3, color: "#a1a1aa", fontSize: isStory ? 19 : 16 }}>
              EN BIBLIOTECA
            </div>
          </div>
          <div
            style={{
              minWidth: isStory ? 225 : 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: isStory ? "18px 30px" : "14px 26px",
              borderRadius: isStory ? 22 : 18,
              border: `1px solid ${palette.accentBorder}`,
              background: "rgba(9,9,11,0.62)",
            }}
          >
            <div style={{ display: "flex", color: "#ffffff", fontSize: isStory ? 38 : 31, fontWeight: 900 }}>
              {readBooks}
            </div>
            <div style={{ display: "flex", marginTop: 3, color: "#a1a1aa", fontSize: isStory ? 19 : 16 }}>
              {readBooks === 1 ? "LEÍDO" : "LEÍDOS"}
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
        <div style={{ display: "flex" }}>Descubre tu próxima lectura indie</div>
        <div style={{ display: "flex", color: palette.accent, fontWeight: 800 }}>
          cazaindie.com
        </div>
      </div>
    </div>
  )
}
