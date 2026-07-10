"use client"

import GenreBadge from "@/components/GenreBadge"
import { genresCatalog } from "@/data/genres"
import { FaCrown } from "react-icons/fa"

export default function AuthorPreview({
  author,
  books = []
}: {
  author: any
  books: any[]
}) {

  if (!author) return null


  const themeColors: any = {
    zinc: {
      bg: "from-zinc-950 to-black",
      card: "bg-zinc-900"
    },

    blue: {
      bg: "from-blue-950 to-black",
      card: "bg-blue-950/40"
    },

    emerald: {
      bg: "from-emerald-950 to-black",
      card: "bg-emerald-950/40"
    },

    rose: {
      bg: "from-rose-950 to-black",
      card: "bg-rose-950/40"
    }
  }


  const theme =
    themeColors[
    author.theme?.background ?? "zinc"
    ] ?? themeColors.zinc


  const featured =
    books.find(
      book =>
        book.id === author.featured_book_id
    )


  return (

    <div
      className={`
                rounded-3xl
                overflow-hidden
                border
                border-zinc-800
                bg-gradient-to-b
                ${theme.bg}
                text-white
                shadow-2xl
            `}
    >


      {/* Banner */}

      <div
        className="
                    relative
                    h-32
                    bg-zinc-900
                "
      >

        {author.banner && (

          <img
            src={author.banner}
            className="
                            w-full
                            h-full
                            object-cover
                            opacity-60
                        "
          />

        )}

      </div>



      <div className="p-5">


        {/* Avatar */}

        <div className="-mt-14">

          <img
            src={
              author.avatar ||
              "/avatars/default.jpg"
            }
            className="
                            w-24
                            h-24
                            rounded-2xl
                            object-cover
                            border-4
                            border-zinc-950
                            shadow-xl
                        "
          />

        </div>



        {/* Nombre */}

        <div className="mt-4">

          <div className="flex items-center gap-2">

            <h2 className="
                            text-2xl
                            font-bold
                        ">
              {author.name}
            </h2>


            {author.pro && (

              <FaCrown
                className="
                                    text-yellow-400
                                "
              />

            )}

          </div>


          {author.style && (

            <p className="
                            mt-1
                            text-yellow-400
                            text-sm
                        ">
              {author.style}
            </p>

          )}

        </div>



        {/* Bio */}

        {author.bio && (

          <div
            className={`
                            mt-5
                            p-4
                            rounded-2xl
                            ${theme.card}
                            border
                            border-zinc-800
                        `}
          >

            <p className="
                            text-sm
                            text-zinc-300
                            line-clamp-5
                        ">
              {author.bio}
            </p>

          </div>

        )}



        {/* Libro destacado */}

        {featured && (

          <div className="mt-6">

            <p className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-500
                            mb-3
                        ">
              Libro destacado
            </p>


            <div className="
                            flex
                            gap-4
                            items-center
                        ">

              <img
                src={featured.cover}
                className="
                                    w-20
                                    aspect-[2/3]
                                    rounded-xl
                                    object-cover
                                "
              />


              <div>

                <h3 className="
                                    font-semibold
                                    line-clamp-2
                                ">
                  {featured.title}
                </h3>


                <div className="
                                    mt-2
                                    flex
                                    flex-wrap
                                    gap-1
                                ">

                  {(featured.genres ?? [])
                    .slice(0, 2)
                    .map((id: string) => {

                      const genre =
                        genresCatalog.find(
                          g =>
                            g.id === id
                        )

                      if (!genre)
                        return null


                      return (

                        <GenreBadge
                          key={id}
                          label={genre.label}
                          type={id}
                        />

                      )

                    })
                  }


                  {featured.is_saga && (

                    <span
                      className="
                                                text-[10px]
                                                px-2
                                                py-1
                                                rounded-full
                                                bg-purple-500/20
                                                text-purple-300
                                            "
                    >
                      📚 Saga
                    </span>

                  )}

                </div>

              </div>


            </div>

          </div>

        )}



      </div>


    </div>

  )

}