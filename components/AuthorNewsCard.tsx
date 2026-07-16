import Link from "next/link"
import { UserRound } from "lucide-react"
import { getAuthorTheme } from "@/lib/authorTheme"

export default function AuthorNewsCard({
  item
}: {
  item: any
}) {

  const authorTheme = getAuthorTheme(item)

  return (

    <Link
      href={`/authors/${item.slug}`}
      className="
                block
                bg-zinc-900
                border
                border-zinc-800
                rounded-xl
                p-4
                hover:border-yellow-500/40
                hover:bg-zinc-800
                transition
            "
    >

      <div className="flex gap-4">

        <div className="relative shrink-0">

          {item.avatar ? (

            <img
              src={item.avatar}
              className="w-12 h-12 rounded-full object-cover border"
              style={{
                borderColor: authorTheme.primary
              }}
            />

          ) : (

            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: "#27272a",
                borderColor: authorTheme.primary
              }}
            >
              <UserRound
                className="w-6 h-6"
                style={{
                  color: authorTheme.primary
                }}
              />
            </div>

          )}

        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <h3 className="font-semibold text-zinc-100 truncate">
              {item.name}
            </h3>

          </div>


          {item.news?.type && (
            <span
              className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400"
            >
              {item.news.type}
            </span>
          )}


          <p className="mt-2 text-sm text-zinc-300 line-clamp-2">
            {item.news?.title}
          </p>


          <p className="mt-1 text-xs text-zinc-500">
            {new Date(
              item.news_updated_at
            ).toLocaleDateString(
              "es-MX",
              {
                day: "numeric",
                month: "short"
              }
            )}
          </p>

        </div>

      </div>

    </Link>

  )
}