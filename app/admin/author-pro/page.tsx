"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type ProAuthor = {
  id: string
  name: string
  slug: string
  pro: boolean
  pro_until: string | null
  stripe_pro_active: boolean
  complimentary_pro: boolean
}

type AuthorFilter = "all" | "complimentary" | "stripe"

export default function AdminAuthorProPage() {
  const [authors, setAuthors] = useState<ProAuthor[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<AuthorFilter>("all")
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    async function loadAuthors() {
      try {
        const response = await fetch("/api/admin/author-pro", {
          cache: "no-store",
        })
        const result = (await response.json().catch(() => null)) as
          | { authors?: ProAuthor[]; error?: string }
          | null

        if (!response.ok || !result?.authors) {
          throw new Error(result?.error ?? "No se pudieron cargar los autores")
        }

        setAuthors(result.authors)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los autores"
        )
      } finally {
        setLoading(false)
      }
    }

    void loadAuthors()
  }, [])

  const filteredAuthors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es")

    return authors.filter((author) => {
      if (filter === "complimentary" && !author.complimentary_pro) return false
      if (filter === "stripe" && !author.stripe_pro_active) return false

      return (
        !normalizedQuery ||
        `${author.name} ${author.slug}`
          .toLocaleLowerCase("es")
          .includes(normalizedQuery)
      )
    })
  }, [authors, filter, query])

  const complimentaryCount = authors.filter(
    (author) => author.complimentary_pro
  ).length
  const stripeCount = authors.filter(
    (author) => author.stripe_pro_active
  ).length

  async function setComplimentaryPro(author: ProAuthor, enabled: boolean) {
    setSavingId(author.id)
    setError("")
    setNotice("")

    try {
      const response = await fetch("/api/admin/author-pro", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: author.id, enabled }),
      })
      const result = (await response.json().catch(() => null)) as
        | { author?: ProAuthor; error?: string }
        | null

      if (!response.ok || !result?.author) {
        throw new Error(result?.error ?? "No se pudo guardar el cambio")
      }

      setAuthors((current) =>
        current.map((item) =>
          item.id === author.id ? result.author! : item
        )
      )
      setNotice(
        enabled
          ? `Cortesía PRO activada para ${author.name}.`
          : `Cortesía PRO retirada de ${author.name}.`
      )
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el cambio"
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Administración
            </p>
            <h1 className="mt-1 text-3xl font-bold">Cortesías PRO</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Activa beneficios permanentes sin crear pagos en Stripe. Una
              cortesía se mantiene aunque la suscripción del autor se cancele.
            </p>
          </div>
          <Link
            href="/me"
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium transition hover:bg-zinc-800"
          >
            Volver a Mi espacio
          </Link>
        </div>

        <label className="mt-8 block text-sm font-medium text-zinc-300">
          Buscar autor
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre o slug"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-400"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtrar autores">
          {([
            ["all", `Todos (${authors.length})`],
            ["complimentary", `Con cortesía (${complimentaryCount})`],
            ["stripe", `Con Stripe (${stripeCount})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === value
                  ? "bg-amber-500 text-black"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
            {notice}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-zinc-400">Cargando autores...</p>
        ) : (
          <div className="mt-8 space-y-3">
            {filteredAuthors.map((author) => (
              <article
                key={author.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/authors/${author.slug}`}
                      target="_blank"
                      className="font-semibold hover:text-amber-300"
                    >
                      {author.name}
                    </Link>
                    {author.pro && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                        PRO activo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    /authors/{author.slug}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        author.stripe_pro_active
                          ? "bg-blue-500/15 text-blue-200"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Stripe: {author.stripe_pro_active ? "activo" : "inactivo"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        author.complimentary_pro
                          ? "bg-green-500/15 text-green-200"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Cortesía: {author.complimentary_pro ? "activa" : "inactiva"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingId !== null}
                  onClick={() =>
                    setComplimentaryPro(author, !author.complimentary_pro)
                  }
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    author.complimentary_pro
                      ? "border border-red-500/30 text-red-200 hover:bg-red-500/10"
                      : "bg-amber-500 text-black hover:bg-amber-400"
                  }`}
                >
                  {savingId === author.id
                    ? "Guardando..."
                    : author.complimentary_pro
                      ? "Retirar cortesía"
                      : "Dar cortesía PRO"}
                </button>
              </article>
            ))}

            {filteredAuthors.length === 0 && (
              <p className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
                No se encontraron autores.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
