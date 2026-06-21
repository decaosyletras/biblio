import Link from "next/link"

import { books } from "@/data/books"
import { categories } from "@/data/categories"
import { categoryRules } from "@/data/categoryRules"

import BookRow from "@/components/BookRow"
import SearchSimple from "@/components/SearchSimple"

import { getCategoriesForBook } from "@/data/categoryEngine"

import { thematicCollections } from "@/data/thematicCollections"

export default function Page() {
  return (
    <div className="relative">

      <section className="py-10">

        {/* ========================= */}
        {/* HERO */}
        {/* ========================= */}

        <div className="px-6 mb-10">

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Explorando historias
          </h1>

          <p className="text-sm text-zinc-400 mt-2">
            Algunos enlaces son de afiliado: si compras a través de ellos,
            puedo recibir una comisión sin costo extra para ti. Esto no afecta las ganancias del autor y contribuye al mantenimiento y crecimiento de este proyecto.{" "}
            <Link
              href="/afiliados"
              className="text-yellow-400 hover:underline"
            >
              Más información.
            </Link>
          </p>
          
        </div>

        {/* ========================= */}
        {/* SEARCH */}
        {/* ========================= */}

        <div className="px-6 mb-14">
          <SearchSimple
            data={books}
            type="books"
          />
        </div>

        {/* TODOS LOS LIBROS */}
        <section className="space-y-4">

          <div className="px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
              Todos los libros
            </h2>

            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Explora todo el catálogo sin filtros.
            </p>
          </div>

          <BookRow
            title=""
            books={books}
            noShuffle={false}
          />

        </section>

        {/* ========================= */}
        {/* 🌌 DESCUBRIMIENTO CURADO */}
        {/* ========================= */}

        <div className="space-y-14">

          {categoryRules
            .filter((category) => category.id !== "todos")
            .map((category) => {

              const filteredBooks = books.filter((book) =>
                getCategoriesForBook(book).some(
                  (c) => c.id === category.id
                )
              )

              if (filteredBooks.length === 0) return null

              return (
                <section
                  key={category.id}
                  className="space-y-4"
                >

                  {/* HEADER */}
                  <div className="px-6">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
                          {category.name}
                        </h2>

                        {category.description && (
                          <p className="mt-2 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
                            {category.description}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* BOOKS */}
                  <BookRow
                    title=""
                    books={filteredBooks}
                    noShuffle={false}
                  />

                </section>
              )
            })}

        </div>


        {/* ========================= */}
        {/* TEMAS DESTACADOS */}
        {/* ========================= */}

        <div className="mt-24 space-y-14">

          <div className="px-6">

            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
              Temas destacados
            </h2>

            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Explora historias agrupadas por temas, ideas y elementos narrativos.
            </p>

          </div>

          {thematicCollections.map((theme) => {

            const filteredBooks = books.filter((book) =>
              (book.review?.metrics ?? []).includes(theme.id)
            )
            //console.log("THEME DEBUG:", theme.id, filteredBooks.length)
            if (filteredBooks.length === 0) return null

            return (
              <BookRow
                key={theme.id}
                title={theme.name}
                books={filteredBooks}
                noShuffle={false}
              />
            )
          })}

        </div>



        {/* ========================= */}
        {/* ✨ COLECCIONES ESPECIALES */}
        {/* ========================= */}

        {categories.length > 0 && (

          <div className="mt-24 space-y-14">

            {/* HEADER */}
            <div className="px-6">

              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
                Colecciones especiales
              </h2>

            </div>

            {/* ROWS */}
            {categories.map((category) => {

              const filteredBooks = books.filter((book) =>
                book.categories?.includes(category.id)
              )

              if (filteredBooks.length === 0) return null

              return (
                <BookRow
                  key={category.id}
                  title={category.name}
                  books={filteredBooks}
                  noShuffle={[7, 9].includes(category.id)}
                />
              )
            })}

          </div>
        )}

      </section>

    </div>
  )
}