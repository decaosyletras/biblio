import Link from "next/link"
import { Author } from "@/types"

export default function CardAuthor({ author }: { author: Author }) {
  return (
    <Link href={`/autores/${author.slug}`}>
      <div className="text-center p-4 bg-white rounded-xl shadow 
                      hover:-translate-y-1 transition">

        <img
          src={author.avatar}
          className="w-24 h-24 rounded-full mx-auto object-cover"
        />

        <h3 className="mt-3 font-semibold">{author.name}</h3>
        <p className="text-sm text-gray-500">{author.bio}</p>
      </div>
    </Link>
  )
}