import Link from "next/link"
import { UserRound } from "lucide-react"
import type { PublicReaderSummary } from "@/lib/readers"

export default function CardReader({
  reader,
}: {
  reader: PublicReaderSummary
}) {
  return (
    <Link
      href={`/readers/${reader.username}`}
      className="group block min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700"
    >
      <div className="flex min-w-0 gap-3">
        {reader.avatarUrl ? (
          // Reader avatars use the installation's runtime Supabase host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reader.avatarUrl}
            alt={`Avatar de ${reader.displayName}`}
            className="h-16 w-16 shrink-0 rounded-xl border border-zinc-700 object-cover shadow-lg sm:h-20 sm:w-20"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 sm:h-20 sm:w-20">
            <UserRound size={30} className="text-zinc-500 sm:h-[34px] sm:w-[34px]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-white">
            {reader.displayName}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm text-zinc-500">
            {reader.bio || "Lector de literatura independiente"}
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            {reader.bookCount} {reader.bookCount === 1 ? "libro" : "libros"}
            {" · "}
            {reader.readCount} {reader.readCount === 1 ? "leído" : "leídos"}
          </p>
        </div>
      </div>
    </Link>
  )
}
