/* eslint-disable @next/next/no-img-element -- ImageResponse necesita elementos img para incrustar los datos binarios. */
import type { ReactElement } from "react"

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
}

export const READER_SHARE_IMAGE_SIZES: Record<
  ReaderShareImageFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
}

export function renderReaderShareImage({
  displayName,
  avatarDataUrl,
  totalBooks,
  readBooks,
  books,
  format,
}: ReaderShareImageData): ReactElement {
  const isStory = format === "story"
  const coverWidth = isStory ? 360 : 270
  const coverHeight = isStory ? 540 : 405
  const coverGap = isStory ? 28 : 22
  const avatarSize = isStory ? 132 : 104
  const initial = displayName.trim().charAt(0).toUpperCase() || "L"

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
        background:
          "linear-gradient(145deg, #07152d 0%, #0f1f3c 38%, #18181b 70%, #09090b 100%)",
        padding: isStory ? "78px 76px" : "52px 64px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: 999,
          background: "rgba(37, 99, 235, 0.22)",
          filter: "blur(80px)",
          left: -280,
          top: -260,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: 999,
          background: "rgba(234, 179, 8, 0.12)",
          filter: "blur(75px)",
          right: -240,
          bottom: -200,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: isStory ? 30 : 25,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          CAS(<span style={{ color: "#ef4444" }}>Z</span>)A DE LIBROS
        </div>
        <div
          style={{
            display: "flex",
            color: "#facc15",
            fontSize: isStory ? 24 : 20,
            fontWeight: 700,
          }}
        >
          LITERATURA INDIE
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: isStory ? 68 : 38,
          position: "relative",
          zIndex: 1,
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
              borderRadius: 32,
              border: "3px solid rgba(250, 204, 21, 0.75)",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: 32,
              border: "3px solid rgba(250, 204, 21, 0.75)",
              background: "#27272a",
              color: "#facc15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isStory ? 62 : 48,
              fontWeight: 800,
            }}
          >
            {initial}
          </div>
        )}

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            marginLeft: isStory ? 32 : 25,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: isStory ? 48 : 38,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: isStory ? 720 : 760,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              color: "#a1a1aa",
              fontSize: isStory ? 25 : 21,
            }}
          >
            Mi biblioteca en Cas(z)a de Libros
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: isStory ? 66 : 34,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: isStory ? 70 : 52,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          Mi biblioteca indie
        </div>
        <div
          style={{
            display: "flex",
            marginTop: isStory ? 24 : 17,
            padding: isStory ? "14px 26px" : "10px 20px",
            borderRadius: 999,
            background: "rgba(9, 9, 11, 0.58)",
            border: "1px solid rgba(250, 204, 21, 0.28)",
            color: "#d4d4d8",
            fontSize: isStory ? 27 : 22,
          }}
        >
          {totalBooks} {totalBooks === 1 ? "libro" : "libros"} · {readBooks}{" "}
          {readBooks === 1 ? "leído" : "leídos"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: coverGap,
          marginTop: isStory ? 56 : 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        {books.map((book, index) => (
          <div
            key={`${book.title}-${index}`}
            style={{
              width: coverWidth,
              height: coverHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: isStory ? 26 : 22,
              border: "2px solid rgba(255, 255, 255, 0.14)",
              background: "#27272a",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.42)",
            }}
          >
            {book.coverDataUrl ? (
              <img
                src={book.coverDataUrl}
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
                  padding: 32,
                  color: "#d4d4d8",
                  fontSize: isStory ? 29 : 24,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: "center",
                  background:
                    "linear-gradient(145deg, #27272a 0%, #18181b 100%)",
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
          alignItems: "center",
          justifyContent: "center",
          marginTop: "auto",
          paddingTop: isStory ? 42 : 24,
          color: "#a1a1aa",
          fontSize: isStory ? 24 : 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        Descubre libros independientes en Cas(z)a de Libros
      </div>
    </div>
  )
}
