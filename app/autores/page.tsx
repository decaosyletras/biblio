import { authors } from "@/data/authors"
import CardAuthor from "@/components/CardAuthor"
import Link from "next/link"
import SearchAuthors from "@/components/SearchAuthors"
import SearchOverlay from "@/components/SearchOverlay"

export default function Page() {
  return (
    <section className="py-16">

      <h1 className="text-3xl font-semibold text-zinc-100 px-6 mb-8">
        Autores
      </h1>

      <SearchOverlay
        placeholder="Buscar autores..."
        data={authors}
        type="authors"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6">

        {authors.map(author => (
          <Link key={author.slug} href={`/autores/${author.slug}`}>
            <CardAuthor key={author.slug} author={author} />
          </Link>
        ))}

      </div>

    </section>
  )
}