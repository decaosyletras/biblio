import { getAuthors } from "@/lib/authors"
import CardAuthor from "@/components/CardAuthor"

export const dynamic = "force-dynamic"

export default async function AuthorsPage() {

    const authors = await getAuthors()

    return (

        <section className="py-16 px-6">

            <h1 className="text-3xl font-semibold text-zinc-100 mb-10">
                Autores
            </h1>

            <p className="text-zinc-400 mb-10">
                Descubre escritores independientes y conoce sus obras.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

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