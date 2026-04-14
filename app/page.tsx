import Link from "next/link"
import { books } from "@/data/books"
import { authors } from "@/data/authors"
import CardBook from "@/components/CardBook"
import { shuffleArray } from "@/lib/shuffle"
import CardReview from "@/components/CardReview"

export default function Home() {
  const randomBooks = shuffleArray(books).slice(0, 4)
  const randomAuthors = shuffleArray(authors).slice(0, 4)
  const randomReviews = shuffleArray(books).slice(0, 3)

  return (
    <div className="text-zinc-100">

      {/* HERO */}
      <section className="py-28 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Descubre historias que valen la pena
        </h1>

        <p className="mt-6 text-zinc-400 max-w-2xl mx-auto">
          Reseñas rápidas, autores independientes y libros que probablemente no conocías.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/resenas" className="bg-white text-black px-6 py-3 rounded-full">
            Explorar reseñas
          </Link>

          <Link href="/libros" className="border border-zinc-600 px-6 py-3 rounded-full">
            Ver libros
          </Link>
        </div>
      </section>

      {/* FRASES */}
      <section className="py-16 text-center space-y-6">
        <p className="text-xl text-zinc-300">
          “Un buen libro te cambia, uno grande te persigue.”
        </p>

        <p className="text-zinc-500">
          “Escribir es dejar una parte de ti en alguien que no conoces.”
        </p>
      </section>

      {/* LIBROS */}
      <section className="py-16 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Libros</h2>
          <Link href="/libros" className="text-zinc-400 hover:text-white">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {randomBooks.map(book => (
            <CardBook key={book.slug} book={book} />
          ))}
        </div>
      </section>

      {/* AUTORES */}
      <section className="py-16 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Autores</h2>
          <Link href="/autores" className="text-zinc-400 hover:text-white">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {randomAuthors.map(author => (
            <Link key={author.slug} href={`/autores/${author.slug}`}>
              <div className="bg-zinc-800 p-4 rounded-xl text-center hover:scale-105 transition">
                <img
                  src={author.avatar}
                  className="w-16 h-16 rounded-full mx-auto"
                />
                <p className="mt-3">{author.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="py-16 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Reseñas destacadas
          </h2>

          <a href="/resenas" className="text-zinc-400 hover:text-white">
            Ver todas →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {randomReviews.map(book => (
            <CardReview key={book.slug} book={book} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-2xl font-semibold">
          ¿Eres escritor independiente?
        </h2>

        <p className="text-zinc-400 mt-4">
          Comparte tu historia y llega a nuevos lectores.
        </p>

        <Link
          href="/contacto"
          className="inline-block mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full"
        >
          Contactar
        </Link>
      </section>

    </div>
  )
}