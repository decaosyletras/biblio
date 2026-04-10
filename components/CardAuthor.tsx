import Link from "next/link"
import { Author } from "@/types"

export default function CardAuthor({ author }: { author: Author }) {
  return (
    <Link href={`/autores/${author.slug}`}>
      <div className="text-center p-6 bg-zinc-800 text-zinc-100 rounded-2xl shadow rounded-2xl shadow-sm hover:shadow-lg transition">

        <img
          src={author.avatar}
          className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-100"
        />

        <h3 className="mt-4 font-semibold text-lg">{author.name}</h3>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {author.bio}
        </p>
      </div>
    </Link>
  )
}