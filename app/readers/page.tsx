import ReaderDirectory from "@/components/readers/ReaderDirectory"
import { getPublicReaders } from "@/lib/readers"

export const dynamic = "force-dynamic"

export default async function ReadersPage() {
  const readers = await getPublicReaders()

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100 sm:mb-10 sm:text-3xl">
        Lectores
      </h1>

      <p className="mb-6 text-zinc-400 sm:mb-10">
        Descubre lectores, sus intereses y sus bibliotecas indie.
      </p>

      <ReaderDirectory readers={readers} />
    </section>
  )
}
