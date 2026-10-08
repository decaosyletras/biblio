import Link from "next/link"
import { Crown, UserRound } from "lucide-react"
import { getAuthorTheme } from "@/lib/authorTheme"

export default function CardAuthor({
  author,
  variant = "default"
}: {
  author: any
  variant?: "default" | "featured"
}) {

  const authorTheme = getAuthorTheme(author)

  return (

    <Link
      href={`/authors/${author.slug}`}
      className={`group block min-w-0 overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-300 p-4

        ${variant === "featured"
          ? `
                border border-zinc-800 hover:border-zinc-700 hover:-translate-y-1
            `
          : `
                hover:bg-zinc-800
            `
        }
    `}
      style={
        variant === "featured"
          ? {
            boxShadow:
              "0 10px 30px rgba(0,0,0,.25)"
          }
          : undefined
      }
    >

      <div className="flex gap-3 min-w-0">

        <div className="shrink-0">

          {author.avatar ? (

            <img
              src={author.avatar}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shadow-lg"
              style={{
                borderColor: authorTheme.border
              }}
            />

          ) : (

            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "#27272a",
                borderColor: authorTheme.primary
              }}
            >

              <UserRound
                size={30}
                className="sm:w-[34px] sm:h-[34px]"
                style={{
                  color: authorTheme.primary
                }}
              />

            </div>

          )}

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2">

            <h3 className="font-semibold text-white truncate">
              {author.name}
            </h3>

            {author.pro === true && (
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-yellow-400/15 bg-yellow-400/[0.06]"
                aria-label="Autor PRO"
                title="Autor PRO"
                style={{
                  boxShadow: "0 0 8px rgba(250, 204, 21, .12)"
                }}
              >
                <Crown
                  size={12}
                  className="text-yellow-300/85"
                  aria-hidden="true"
                />
              </div>
            )}

          </div>

          <p className="text-sm text-zinc-500 mt-1 line-clamp-3">

            {author.bio ||
              author.style ||
              "Autor independiente"}

          </p>

          <p className="text-xs text-zinc-400 mt-3">

            {author.booksCount}

            {" "}

            {author.booksCount === 1
              ? "libro publicado"
              : "libros publicados"}

          </p>

        </div>

      </div>

    </Link>

  )
}
