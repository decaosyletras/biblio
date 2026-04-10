import { authors } from "@/data/authors"
import CardAuthor from "@/components/CardAuthor"

export default function Page() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">

        <h1 className="text-3xl font-semibold mb-10">Autores</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {authors.map(a => (
            <CardAuthor key={a.slug} author={a} />
          ))}
        </div>

      </div>
    </section>
  )
}