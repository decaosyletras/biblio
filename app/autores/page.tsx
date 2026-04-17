import { authors } from "@/data/authors"
import CardAuthor from "@/components/CardAuthor"
import Link from "next/link"
import SearchSimple from "@/components/SearchSimple"
import { shuffleArray } from "@/lib/shuffle"

export default function Page() {
  const randomAuthors = shuffleArray(authors)
  return (
    <section className="py-16">

      <h1 className="text-3xl font-semibold text-zinc-100 px-6 mb-8">
        Autores
      </h1>

      <SearchSimple data={authors} type="authors" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6">

        {randomAuthors.map(author => (
          <CardAuthor key={author.slug} author={author} />
        ))}

      </div>

    </section>
  )
}