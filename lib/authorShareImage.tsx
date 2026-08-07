/* eslint-disable @next/next/no-img-element -- ImageResponse necesita img para incrustar imágenes procesadas. */
import type { ReactElement } from "react"

export type AuthorShareImageFormat = "story" | "post"
export type AuthorShareImageKind = "profile" | "featured" | "news"

export const AUTHOR_SHARE_IMAGE_SIZES: Record<
  AuthorShareImageFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
}

type ShareBook = {
  title: string
  coverDataUrl: string | null
}

type AuthorShareImageData = {
  authorName: string
  style: string
  avatarDataUrl: string | null
  bannerDataUrl: string | null
  books: ShareBook[]
  featuredBook: ShareBook | null
  news: {
    type: string
    title: string
    content: string
    imageDataUrl: string | null
  } | null
  format: AuthorShareImageFormat
  kind: AuthorShareImageKind
  palette: {
    background: string
    surface: string
    primary: string
    text: string
    muted: string
    border: string
  }
}

function Brand({ accent, isStory }: { accent: string; isStory: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: isStory ? 29 : 23,
        fontWeight: 800,
        letterSpacing: 1.3,
        position: "relative",
      }}
    >
      <div style={{ display: "flex" }}>
        CAS(<span style={{ color: "#ef4444" }}>Z</span>)A DE LIBROS
      </div>
      <div style={{ display: "flex", color: accent }}>LITERATURA INDIE</div>
    </div>
  )
}

function Footer({ accent, isStory }: { accent: string; isStory: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: isStory ? 62 : 42,
        justifyContent: "center",
        color: accent,
        fontSize: isStory ? 23 : 18,
        fontWeight: 700,
      }}
    >
      Descubre su página en Cas(z)a de Libros
    </div>
  )
}

function Cover({
  book,
  width,
  height,
  border,
}: {
  book: ShareBook
  width: number
  height: number
  border: string
}) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 24,
        border: `2px solid ${border}`,
        background: "#27272a",
        boxShadow: "0 28px 70px rgba(0,0,0,.45)",
      }}
    >
      {book.coverDataUrl ? (
        <img
          src={book.coverDataUrl}
          alt=""
          width={width}
          height={height}
          style={{ width, height, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
            textAlign: "center",
            color: "#e4e4e7",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          {book.title}
        </div>
      )}
    </div>
  )
}

export function renderAuthorShareImage({
  authorName,
  style,
  avatarDataUrl,
  bannerDataUrl,
  books,
  featuredBook,
  news,
  format,
  kind,
  palette,
}: AuthorShareImageData): ReactElement {
  const isStory = format === "story"
  const initial = authorName.trim().charAt(0).toUpperCase() || "A"
  const padding = isStory ? "76px 72px" : "50px 62px"
  const background = `linear-gradient(145deg, ${palette.background} 0%, ${palette.surface} 62%, #09090b 100%)`

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
        padding,
        color: palette.text,
        background,
        fontFamily: "sans-serif",
      }}
    >
      {kind === "profile" && bannerDataUrl && (
        <img
          src={bannerDataUrl}
          alt=""
          width={1080}
          height={isStory ? 680 : 440}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: isStory ? 680 : 440,
            objectFit: "cover",
            opacity: 0.32,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          width: isStory ? 720 : 560,
          height: isStory ? 720 : 560,
          left: isStory ? -370 : -300,
          top: isStory ? 360 : 230,
          borderRadius: 999,
          background: `${palette.primary}20`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isStory ? 620 : 480,
          height: isStory ? 620 : 480,
          right: isStory ? -330 : -260,
          bottom: isStory ? -250 : -210,
          borderRadius: 999,
          border: `80px solid ${palette.primary}12`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: isStory ? 28 : 22,
          right: isStory ? 28 : 22,
          top: isStory ? 28 : 22,
          bottom: isStory ? 28 : 22,
          border: `2px solid ${palette.border}`,
          borderRadius: isStory ? 38 : 30,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: isStory ? 210 : 150,
          width: isStory ? 15 : 11,
          height: isStory ? 330 : 245,
          borderRadius: "20px 0 0 20px",
          background: palette.primary,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(9,9,11,.08), rgba(9,9,11,.28) 45%, rgba(9,9,11,.48))",
        }}
      />

      <Brand accent={palette.primary} isStory={isStory} />

      {kind === "profile" && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: isStory ? 100 : 54,
              position: "relative",
            }}
          >
            <div
              style={{
                width: isStory ? 250 : 188,
                height: isStory ? 250 : 188,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: isStory ? 220 : 164,
                  height: isStory ? 220 : 164,
                  borderRadius: 42,
                  background: palette.primary,
                  transform: "rotate(9deg)",
                  opacity: 0.55,
                }}
              />
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt=""
                  width={isStory ? 230 : 170}
                  height={isStory ? 230 : 170}
                  style={{
                    width: isStory ? 230 : 170,
                    height: isStory ? 230 : 170,
                    objectFit: "cover",
                    borderRadius: 42,
                    border: `4px solid ${palette.primary}`,
                    boxShadow: "0 25px 70px rgba(0,0,0,.5)",
                    position: "relative",
                  }}
                />
              ) : (
                <div
                  style={{
                  width: isStory ? 230 : 170,
                  height: isStory ? 230 : 170,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 42,
                  border: `4px solid ${palette.primary}`,
                  background: palette.surface,
                  color: palette.primary,
                  fontSize: isStory ? 100 : 74,
                  fontWeight: 900,
                  position: "relative",
                }}
              >
                {initial}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: isStory ? 44 : 28,
                color: palette.primary,
                fontSize: isStory ? 28 : 22,
                fontWeight: 800,
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              Conoce a
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                maxWidth: 920,
                textAlign: "center",
                fontSize: authorName.length > 35
                  ? isStory ? 58 : 45
                  : isStory ? 72 : 56,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              {authorName}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                color: palette.muted,
                fontSize: isStory ? 29 : 23,
                textAlign: "center",
              }}
            >
              {style || "Autor independiente"}
            </div>
          </div>

          {books.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: isStory ? 72 : 40,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: palette.muted,
                  fontSize: isStory ? 22 : 17,
                  fontWeight: 800,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                Historias para descubrir
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: isStory ? 18 : 14,
                  marginTop: isStory ? 34 : 23,
                }}
              >
                {books.slice(0, 3).map((book, index) => (
                  <div
                    key={`${book.title}-${index}`}
                    style={{
                      display: "flex",
                      transform: `rotate(${index === 0 ? -5 : index === 2 ? 5 : 0}deg) translateY(${index === 1 ? -14 : 5}px)`,
                    }}
                  >
                    <Cover
                      book={book}
                      width={isStory ? 250 : 205}
                      height={isStory ? 375 : 308}
                      border={index === 1 ? palette.primary : palette.border}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {kind === "featured" && featuredBook && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: isStory ? 90 : 48,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                color: palette.primary,
                fontSize: isStory ? 29 : 23,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Libro destacado
            </div>
            <div style={{ display: "flex", marginTop: isStory ? 46 : 26 }}>
              <Cover
                book={featuredBook}
                width={isStory ? 500 : 350}
                height={isStory ? 750 : 525}
                border={palette.primary}
              />
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 900,
                maxHeight: isStory ? 145 : 105,
                overflow: "hidden",
                marginTop: isStory ? 42 : 27,
                textAlign: "center",
                fontSize: featuredBook.title.length > 55
                  ? isStory ? 46 : 35
                  : isStory ? 58 : 44,
                fontWeight: 900,
                lineHeight: 1.08,
              }}
            >
              {featuredBook.title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 15,
                color: palette.muted,
                fontSize: isStory ? 28 : 22,
              }}
            >
              de {authorName}
            </div>
          </div>
        </div>
      )}

      {kind === "news" && news && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: isStory ? 82 : 45,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              color: palette.primary,
              fontSize: isStory ? 28 : 22,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {news.type || "Novedad"}
          </div>
          {news.imageDataUrl && (
            <img
              src={news.imageDataUrl}
              alt=""
              width={920}
              height={isStory ? 620 : 430}
              style={{
                width: 920,
                height: isStory ? 620 : 430,
                marginTop: isStory ? 42 : 26,
                borderRadius: 30,
                border: `2px solid ${palette.border}`,
                objectFit: "cover",
                boxShadow: "0 28px 70px rgba(0,0,0,.42)",
              }}
            />
          )}
          <div
            style={{
              width: 920,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: isStory ? 48 : 30,
              padding: isStory ? "42px 48px" : "30px 38px",
              borderRadius: 30,
              border: `2px solid ${palette.border}`,
              borderTop: `8px solid ${palette.primary}`,
              background: palette.surface,
              boxShadow: "0 24px 60px rgba(0,0,0,.28)",
            }}
          >
            <div
              style={{
                display: "flex",
                maxWidth: 830,
                color: palette.text,
                textAlign: "center",
                fontSize: news.title.length > 65
                  ? isStory ? 47 : 36
                  : isStory ? 58 : 45,
                fontWeight: 900,
                lineHeight: 1.08,
              }}
            >
              {news.title}
            </div>
            {news.content && (
              <div
                style={{
                  display: "flex",
                  maxWidth: 820,
                  maxHeight: isStory ? 190 : 125,
                  overflow: "hidden",
                  marginTop: isStory ? 27 : 18,
                  color: palette.muted,
                  textAlign: "center",
                  fontSize: isStory ? 25 : 20,
                  lineHeight: 1.45,
                }}
              >
                {news.content}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: isStory ? 36 : 24,
            }}
          >
            {avatarDataUrl ? (
              <img
                src={avatarDataUrl}
                alt=""
                width={isStory ? 70 : 54}
                height={isStory ? 70 : 54}
                style={{
                  width: isStory ? 70 : 54,
                  height: isStory ? 70 : 54,
                  borderRadius: 18,
                  border: `2px solid ${palette.primary}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: isStory ? 70 : 54,
                  height: isStory ? 70 : 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  background: palette.surface,
                  color: palette.primary,
                  fontSize: isStory ? 31 : 24,
                  fontWeight: 900,
                }}
              >
                {initial}
              </div>
            )}
            <div
              style={{
                display: "flex",
                marginLeft: 18,
                color: palette.text,
                fontSize: isStory ? 29 : 23,
                fontWeight: 800,
              }}
            >
              {authorName}
            </div>
          </div>
        </div>
      )}

      <Footer accent={palette.primary} isStory={isStory} />
    </div>
  )
}
