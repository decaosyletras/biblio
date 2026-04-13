import { authors } from "@/data/authors"
import { books } from "@/data/books"
import BookRow from "@/components/BookRow"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const author = authors.find(a => a.slug === slug)

  if (!author) return <div>No encontrado</div>

  const authorBooks = books.filter(
    b => b.authorSlug === author.slug
  )

  const similarAuthors = authors.filter(a =>
    author.similar.includes(a.slug)
  )

  return (
    <div className="text-zinc-100">

      {/* HERO */}
      <section className="relative h-[300px] flex items-end px-6 pb-6">
        
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 flex items-center gap-6">
          <img
            src={author.avatar}
            className="w-24 h-24 rounded-full border-4 border-zinc-800"
          />

          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            <p className="text-zinc-400">{author.bio}</p>
          </div>
        </div>

      </section>

      {/* CONTENIDO */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Quién es */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Quién es
          </h2>
          <p className="text-zinc-400">
            {author.description}
          </p>
        </div>

        {/* Qué esperar */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Qué esperar de sus libros
          </h2>
          <p className="text-zinc-400">
            {author.style}
          </p>
        </div>

        {/* Similares */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Si te gustó, también puedes leer a:
          </h2>

          <div className="flex gap-6">
            {similarAuthors.map(a => (
              <div key={a.slug} className="text-center">
                <img
                  src={a.avatar}
                  className="w-16 h-16 rounded-full mx-auto"
                />
                <p className="mt-2 text-sm">{a.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LIBROS DEL AUTOR (Netflix style) */}
      <BookRow title="Libros del autor" books={authorBooks} />

    </div>
  )
}