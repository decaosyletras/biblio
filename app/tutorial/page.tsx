import Link from "next/link"
import { getPublicTutorials } from "@/lib/tutorials"

export const dynamic = "force-dynamic"

export default async function TutorialPage() {
  const tutorials = await getPublicTutorials()

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">
            Guías rápidas
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            ¿Qué quieres crear?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Elige un tutorial y sigue los pasos para preparar tu espacio en Caza
            Indie.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {tutorials.map((tutorial) => (
            <Link
              key={tutorial.slug}
              href={`/tutorial/${tutorial.slug}`}
              className="group flex min-h-64 flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-7 transition hover:-translate-y-1 hover:border-yellow-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-2xl">
                {tutorial.slug === "autores" ? "✍️" : "📚"}
              </div>
              <h2 className="mt-6 text-2xl font-bold group-hover:text-yellow-300">
                {tutorial.title}
              </h2>
              <p className="mt-3 leading-relaxed text-zinc-400">
                {tutorial.description}
              </p>
              <span className="mt-auto pt-8 text-sm font-semibold text-yellow-400">
                Ver tutorial →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm text-zinc-500">¿Tienes dudas o necesitas ayuda?</p>
          <Link
            href="/conoceme"
            className="mt-3 inline-block text-yellow-400 hover:underline"
          >
            Contactar
          </Link>
        </div>
      </section>
    </main>
  )
}
