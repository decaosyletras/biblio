import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublicTutorials, isTutorialSlug } from "@/lib/tutorials"

export const dynamic = "force-dynamic"

export default async function TutorialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!isTutorialSlug(slug)) notFound()

  const tutorials = await getPublicTutorials()
  const tutorial = tutorials.find((item) => item.slug === slug)
  if (!tutorial) notFound()

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/tutorial"
          className="text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
        >
          ← Todos los tutoriales
        </Link>

        <header className="mt-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">
            Tutorial para {tutorial.slug}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {tutorial.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            {tutorial.description}
          </p>
        </header>

        <div className="mt-14 space-y-8">
          {tutorial.steps.map((step, index) => (
            <article
              key={step.id}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
            >
              {step.imageUrl && (
                <div className="border-b border-zinc-800 bg-black">
                  {/* Las capturas provienen del bucket público administrado de tutoriales. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.imageUrl}
                    alt={`Paso ${index + 1}: ${step.title}`}
                    className="max-h-[42rem] w-full object-contain"
                  />
                </div>
              )}
              <div className="flex gap-4 p-5 sm:gap-5 sm:p-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-sm font-bold text-yellow-300">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                    Paso {index + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                    {step.title}
                  </h2>
                  <p className="mt-2 leading-relaxed text-zinc-400">
                    {step.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-7 text-center">
          <h2 className="text-xl font-semibold">¿Todo listo?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Entra a tu espacio para comenzar o continuar la configuración.
          </p>
          <Link
            href="/me"
            className="mt-5 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
          >
            Ir a Mi espacio
          </Link>
        </div>
      </section>
    </main>
  )
}
