import Link from "next/link"
import { getBooks } from "@/lib/books"
import CardBook from "@/components/CardBook"
import { shuffleArray } from "@/lib/shuffle"
import CardReview from "@/components/CardReview"
import CardAuthor from "@/components/CardAuthor"
import GenreFilter from "@/components/GenreFilter"
import BookRow from "@/components/BookRow"
import { useMemo } from "react";
import AuthorNewsCard from "@/components/AuthorNewsCard"

import {
  getAuthors,
  getLatestAuthorNews
} from "@/lib/authors"


export const dynamic = "force-dynamic";

export default async function Home() {

  const authors = await getAuthors()
  const books = await getBooks()
  const latestNews = await getLatestAuthorNews()

  const randomBooks = shuffleArray(books).slice(0, 4)
  const randomAuthors = shuffleArray(authors).slice(0, 6)
  const randomReviews = shuffleArray(
    books.filter(book => book.review?.title)
  ).slice(0, 3)

  const frases = [
    "Historias que merecen estar en tendencia",
    "Más allá del bestseller",
    "Lecturas que rompen el molde",
    "Voces nuevas con fuerza propia",
    "Historias que merecen ser encontradas",
    "Narrativas que se quedan contigo"
  ];

  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  return (
    <div className="text-zinc-100">

      {/* HERO */}
      <section className="py-10 text-center relative overflow-hidden">

        {/* glow / ambient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-900 via-black to-black opacity-80" />

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold md:font-light tracking-tight md:tracking-normal leading-[1.05]">
          Descubre la literatura independiente
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-300 italic max-w-xl mx-auto leading-relaxed">
          {fraseAleatoria}
        </p>

        {/*<p className="mt-6 text-sm md:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Un espacio para descubrir historias que no siempre tienen foco, pero sí valor
        </p>*/}

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/libros"
            className="
              bg-white text-black
              px-7 py-3
              rounded-full
              font-medium
              transition-all duration-200 ease-out
              hover:scale-105
              active:scale-95
            "
          >
            Catálogo
          </Link>


          <Link
            href="/resenas"
            className="
              border border-zinc-400
              px-7 py-3
              rounded-full
              transition-all duration-200 ease-out
              hover:bg-zinc-800
              hover:scale-105
              active:scale-95
              active:bg-zinc-700
            "
          >
            Lectómetro
          </Link>

        </div>
      </section>

      {/* FRASES */}
      {/*<section className="py-8 text-center">
        <p className="text-zinc-400 text-base md:text-lg italic">
          “Los libros independientes no compiten, resisten.”
        </p>
      </section>*/}

      <GenreFilter />

      {/* NOVEDADES AUTORES */}
      {<section className="pt-12 pb-6 px-6 border-t border-zinc-900">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold">
            Novedades de autores
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Nuevas noticias y anuncios de autores independientes.
          </p>

        </div>

        <div className="h-[420px] overflow-y-auto pr-2 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
          {latestNews.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              No hay novedades recientes.
            </p>
          ) : (
            latestNews.map(item => (
              <AuthorNewsCard
                key={item.id}
                item={item}
              />
            ))
          )}

        </div>

      </section>}

      {/* LIBROS */}
      <section className="py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Libros</h2>
          <Link href="/libros" className="hover:text-white"
            style={{ color: "#eab308" }}>
            Ver todos →
          </Link>
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          Algunos enlaces son de afiliado y pueden generar comisión sin costo extra para ti ni para el autor. {" "}
          <Link
            href="/afiliados"
            className="text-yellow-400 hover:underline"
          >
            Más información.
          </Link>
        </p>
        <BookRow title="" books={books} />
      </section>


      {/* AUTORES */}
      {<section className="py-6 px-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Autores
          </h2>
          <Link
            href="/authors"
            className="hover:text-white"
            style={{ color: "#eab308" }}
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {randomAuthors.map(author => (
            <CardAuthor
              key={author.id}
              author={author}
            />
          ))}

        </div>

      </section>}


      {/* RESEÑAS */}
      <section className="pt-18 pb-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Lectómetro
          </h2>

          <Link href="/resenas" className="hover:text-white"
            style={{ color: "#eab308" }}>
            Ver todas →
          </Link>
        </div>


        <p className="text-sm text-zinc-400 mt-2">
          Opiniones personales sin influencia externa.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {randomReviews.map(book => (
            <CardReview key={book.slug} book={book} />
          ))}
        </div>
      </section>

      {/* CTA */}
      {<section className="py-20 text-center">
        <h2 className="text-2xl font-semibold">
          ¿Eres escritor independiente o conoces a uno?
        </h2>

        <p className="text-zinc-400 mt-4">
          Comparte esa gran historia para que llegue a nuevos lectores.
        </p>

        <Link
          href="/contact"
          className="inline-block mt-6 bg-yellow-500 text-black px-6 py-3 rounded-full"
        >
          Recomendar
        </Link>
      </section>}

    </div>
  )
}