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
      className={`group block rounded-2xl bg-zinc-900 transition-all duration-300 p-4

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

      <div className="flex gap-4">

        <div className="shrink-0">

          {author.avatar ? (

            <img
              src={author.avatar}
              className="w-20 h-20 rounded-xl object-cover border shadow-lg"
              style={{
                borderColor: authorTheme.border
              }}
            />

          ) : (

            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "#27272a",
                borderColor: authorTheme.primary
              }}
            >

              <UserRound
                size={34}
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

            {author.pro && (
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                style={{
                  backgroundColor: "rgba(250, 204, 21, .08)",
                  border: "1px solid rgba(250, 204, 21, .18)",
                  boxShadow: "0 0 10px rgba(250, 204, 21, .20)"
                }}
              >
                <Crown
                  size={14}
                  className="text-yellow-400"
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