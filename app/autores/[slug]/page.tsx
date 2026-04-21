import { authors } from "@/data/authors"
import { books } from "@/data/books"
import BookRow from "@/components/BookRow"
import { getRecommendedAuthors } from "@/lib/recommendAuthors"
import CardAuthor from "@/components/CardAuthor"

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

  const recommendedAuthors = getRecommendedAuthors(author.slug)

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

        

        {/* LIBROS DEL AUTOR (Netflix style) */}
        <h3 className="mt-10 text-xl font-semibold">
          Libros del autor
        </h3>

        <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar">
          {authorBooks.map((book) => (
            <a key={book.slug} href={`/libros/${book.slug}`}>
              <img
                src={book.cover}
                className="w-32 h-48 object-cover rounded-lg"
              />
            </a>
          ))}
        </div>
        <BookRow title="" books={authorBooks} />

        {/* Similares */}
        <div>
          <h3 className="mt-10 text-xl font-semibold">
            Si te gustó también puedes leer a:
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {recommendedAuthors.map((a) => (
              <CardAuthor key={a.slug} author={a} />
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}