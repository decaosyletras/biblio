import { getAuthors } from "@/lib/authors"
import CardAuthor from "@/components/CardAuthor"
import SearchSimple from "@/components/SearchSimple"

export const dynamic = "force-dynamic"

export default async function AuthorsPage() {

    const authors = await getAuthors()

    return (

        <section className="py-10 sm:py-16 px-4 sm:px-6">

            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-6 sm:mb-10">
                Autores Indie
            </h1>

            <p className="text-zinc-400 mb-6 sm:mb-10">
                Descubre escritores independientes y conoce sus obras.
            </p>

            <SearchSimple
                data={authors}
                type="authors"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

                {authors.map(author => (
                    <CardAuthor
                        key={author.id}
                        author={author}
                        variant="featured"
                    />
                ))}

            </div>

        </section>

    )
}