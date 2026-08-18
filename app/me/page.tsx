"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useProfile } from "@/hooks/useProfile"

type OwnedAuthor = {
  id: string
  name: string
  slug: string
  avatar: string
  pro: boolean
  pendingCoverCount: number
}

type UserRow = {
  id: string
  username: string
}

type ReaderProfileSummary = {
  username: string
  isPublic: boolean
}

type ReaderLibrarySummary = {
  total: number
  read: number
}

type AuthorClaim = {
  id: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  authors: {
    name: string
    slug: string
    avatar: string
  } | null
}

function claimStatusLabel(status: AuthorClaim["status"]) {
  if (status === "approved") return "Solicitud aprobada"
  if (status === "pending") return "Pendiente de revisión"
  return "Solicitud rechazada"
}

function claimStatusClasses(status: AuthorClaim["status"]) {
  if (status === "approved") return "bg-green-500/15 text-green-300"
  if (status === "pending") return "bg-yellow-500/15 text-yellow-300"
  return "bg-red-500/15 text-red-300"
}

export default function MePage() {
  const router = useRouter()
  const { user, profile, loading } = useProfile()

  const [author, setAuthor] = useState<OwnedAuthor | null>(null)
  const [loadingAuthor, setLoadingAuthor] = useState(true)
  const [readerProfile, setReaderProfile] =
    useState<ReaderProfileSummary | null>(null)
  const [readerLibrary, setReaderLibrary] =
    useState<ReaderLibrarySummary | null>(null)
  const [loadingReaderData, setLoadingReaderData] = useState(true)
  const [claims, setClaims] = useState<AuthorClaim[]>([])
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [sendingLaunch, setSendingLaunch] = useState(false)
  const [sendingClaimReminder, setSendingClaimReminder] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState("")
  const [savedUsername, setSavedUsername] = useState<string | null>(null)
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [usernameNotice, setUsernameNotice] = useState("")

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, router, user])

  useEffect(() => {
    if (!user) return

    let active = true

    async function loadReaderData() {
      setLoadingReaderData(true)

      try {
        const [profileResponse, libraryResponse] = await Promise.all([
          fetch("/api/readers/profile", { cache: "no-store" }),
          fetch("/api/readers/books", { cache: "no-store" }),
        ])

        if (!active) return

        if (profileResponse.ok) {
          const result = await profileResponse.json()
          setReaderProfile(
            result.hasReaderProfile === true
              ? result.profile ?? null
              : null
          )
        }

        if (libraryResponse.ok) {
          const result = await libraryResponse.json()
          const items = Array.isArray(result.books) ? result.books : []

          setReaderLibrary({
            total: items.length,
            read: items.filter(
              (item: { isRead?: boolean }) => item.isRead === true
            ).length,
          })
        }
      } finally {
        if (active) setLoadingReaderData(false)
      }
    }

    loadReaderData()

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    async function loadAuthor() {
      setLoadingAuthor(true)

      const { data, error } = await supabase
        .from("author_claims")
        .select(`
          status,
          authors (
            id,
            name,
            slug,
            avatar,
            pro
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle()

      if (error || !data?.authors) {
        setAuthor(null)
        setLoadingAuthor(false)
        return
      }

      const authorData = Array.isArray(data.authors)
        ? data.authors[0]
        : data.authors

      if (!authorData) {
        setAuthor(null)
        setLoadingAuthor(false)
        return
      }

      const [directBooksResult, relationBooksResult] = await Promise.all([
        supabase
          .from("books")
          .select("id, cover_source")
          .eq("author_id", authorData.id)
          .eq("approved", true),
        supabase
          .from("book_authors")
          .select("books(id, cover_source, approved)")
          .eq("author_id", authorData.id),
      ])
      const relatedBooks = (relationBooksResult.data ?? []).flatMap((item) => {
        const related = item.books

        return Array.isArray(related) ? related : related ? [related] : []
      })
      const authorBooks = new Map<
        string,
        { id: string; cover_source: string | null }
      >()

      for (const book of [
        ...(directBooksResult.data ?? []),
        ...relatedBooks.filter((book) => book.approved === true),
      ]) {
        authorBooks.set(book.id, book)
      }
      const pendingCoverCount = Array.from(authorBooks.values()).filter(
        (book) =>
          book.cover_source !== "author_upload" &&
          book.cover_source !== "admin_upload"
      ).length

      setAuthor({
        id: authorData.id,
        name: authorData.name,
        slug: authorData.slug,
        avatar: authorData.avatar,
        pro: authorData.pro ?? false,
        pendingCoverCount,
      })
      setLoadingAuthor(false)
    }

    loadAuthor()
  }, [user])

  useEffect(() => {
    if (!user) return

    async function loadClaims() {
      setLoadingClaims(true)

      const { data, error } = await supabase
        .from("author_claims")
        .select(`
          id,
          status,
          created_at,
          authors (
            name,
            slug,
            avatar
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setClaims([])
      } else {
        const normalizedClaims: AuthorClaim[] = (data ?? []).map((claim) => ({
          id: claim.id,
          status: claim.status as AuthorClaim["status"],
          created_at: claim.created_at,
          authors: Array.isArray(claim.authors)
            ? claim.authors[0] ?? null
            : claim.authors ?? null,
        }))

        setClaims(normalizedClaims)
      }

      setLoadingClaims(false)
    }

    loadClaims()
  }, [user])

  async function signOut() {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  function startUsernameEdit() {
    setUsernameDraft(savedUsername ?? profile?.username ?? "")
    setUsernameError("")
    setUsernameNotice("")
    setEditingUsername(true)
  }

  async function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingUsername(true)
    setUsernameError("")
    setUsernameNotice("")

    try {
      const response = await fetch("/api/account/username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: usernameDraft }),
      })
      const result = await response.json()

      if (response.status === 401) {
        router.replace("/login")
        return
      }

      if (!response.ok) {
        setUsernameError(result.error ?? "No se pudo actualizar el nombre de usuario")
        return
      }

      const nextUsername = String(result.username ?? usernameDraft)
      setSavedUsername(nextUsername)
      setEditingUsername(false)
      setUsernameNotice("Nombre de usuario actualizado.")
      router.refresh()
    } catch {
      setUsernameError("No se pudo conectar con tu cuenta")
    } finally {
      setSavingUsername(false)
    }
  }

  async function sendLaunchEmail() {
    const firstConfirmation = window.confirm(
      "⚠️ Vas a enviar el correo de lanzamiento a todos los registros. ¿Continuar?"
    )

    if (!firstConfirmation) return

    const finalConfirmation = window.confirm(
      "🚨 Confirmación final: se enviarán correos reales a usuarios externos. ¿Seguro?"
    )

    if (!finalConfirmation) return

    setSendingLaunch(true)
    const response = await fetch("/api/admin/send-launch-email", {
      method: "POST",
    })
    const result = await response.json()
    setSendingLaunch(false)

    if (result.error) {
      alert(result.error)
      return
    }

    alert(`Correos enviados: ${result.enviados}\nErrores: ${result.errores}`)
  }

  async function sendAuthorClaimReminder() {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas enviar el correo a las personas que aún no reclaman su autor?"
    )

    if (!confirmed) return

    setSendingClaimReminder(true)

    try {
      const response = await fetch("/api/admin/send-author-claim-reminder", {
        method: "POST",
      })
      const result = await response.json()

      if (!response.ok || result.error) {
        alert(result.error ?? "No se pudieron enviar los correos")
        return
      }

      alert(
        `Correos enviados: ${result.enviados}\nOmitidos: ${result.omitidos}\nErrores: ${result.errores}`
      )
    } catch {
      alert("No se pudo conectar con el servicio de correo")
    } finally {
      setSendingClaimReminder(false)
    }
  }

  async function loadUsers() {
    setLoadingUsers(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")

    if (!error && data) setUsers(data)
    setLoadingUsers(false)
  }

  async function deleteUser(id: string) {
    const confirmed = window.confirm(
      "⚠️ Esto borrará el usuario completamente. ¿Continuar?"
    )

    if (!confirmed) return

    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const result = await response.json()

    if (!response.ok || result.error) {
      alert(result.error ?? "No se pudo eliminar el usuario")
      return
    }

    setUsers((current) => current.filter((item) => item.id !== id))
    alert("Usuario eliminado")
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Cargando tu espacio...
      </div>
    )
  }

  const pendingClaim = claims.find((claim) => claim.status === "pending")
  const rejectedClaim = claims.find((claim) => claim.status === "rejected")
  const authorStateLoading = loadingAuthor || loadingClaims
  const isAdmin = profile?.admin === true

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header>
          <h1 className="text-3xl font-semibold sm:text-4xl">Mi espacio</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Una cuenta, dos formas de participar. Puedes tener perfil lector,
            página de autor o ambos.
          </p>
        </header>

        <section>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="flex min-h-full flex-col rounded-3xl border border-yellow-500/25 bg-yellow-500/5 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">
                    Espacio lector
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Tus lecturas, favoritos y perfil público
                  </p>
                </div>

                {!loadingReaderData && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      !readerProfile
                        ? "bg-zinc-800 text-zinc-300"
                        : readerProfile.isPublic
                          ? "bg-green-500/15 text-green-300"
                          : "bg-yellow-500/15 text-yellow-300"
                    }`}
                  >
                    {!readerProfile
                      ? "Sin configurar"
                      : readerProfile.isPublic
                        ? "Público"
                        : "Privado"}
                  </span>
                )}
              </div>

              {loadingReaderData ? (
                <p className="mt-5 text-sm text-zinc-400">
                  Cargando perfil lector...
                </p>
              ) : readerProfile ? (
                <div className="mt-5">
                  <p className="text-sm text-zinc-400">
                    Dirección del perfil:{" "}
                    <span className="font-medium text-zinc-200">
                      /readers/{readerProfile.username}
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Administra tus lecturas y decide qué quieres compartir.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/me/library"
                      className="rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                    >
                      Mi biblioteca
                    </Link>
                    {readerProfile.username && (
                      <Link
                        href={`/readers/${readerProfile.username}`}
                        className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Ver mi perfil
                      </Link>
                    )}
                    <Link
                      href="/me/profile"
                      className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                    >
                      Editar mi perfil
                    </Link>
                  </div>
                  {!readerProfile.isPublic && (
                    <p className="mt-3 text-xs leading-relaxed text-yellow-300/80">
                      Este perfil no es público. Puedes verlo porque es tuyo,
                      pero las demás personas no podrán abrirlo.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Crea un perfil para compartir quién eres como lector. Puedes
                    mantenerlo privado hasta que quieras publicarlo.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/me/library"
                      className="rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                    >
                      Mi biblioteca
                    </Link>
                    <Link
                      href="/me/profile"
                      className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                    >
                      Crear perfil lector
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-auto border-t border-yellow-500/15 pt-5">
                <p className="text-sm text-zinc-400">
                  {loadingReaderData
                    ? "Cargando tus lecturas..."
                    : readerLibrary
                      ? `${readerLibrary.total} ${readerLibrary.total === 1 ? "libro" : "libros"} · ${readerLibrary.read} ${readerLibrary.read === 1 ? "leído" : "leídos"}`
                      : "Organiza tus intereses y lecturas pendientes."}
                </p>
                <Link
                  href="/tutorial/lectores"
                  className="mt-3 inline-flex text-sm font-semibold text-yellow-300 hover:text-yellow-200"
                >
                  Ver tutorial para lectores →
                </Link>
              </div>
            </article>

            <article
              id="mis-solicitudes"
              className="flex min-h-full scroll-mt-28 flex-col rounded-3xl border border-blue-500/25 bg-blue-500/5 p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">
                    Espacio de autor
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Tu obra, novedades y presencia pública
                  </p>
                </div>

                {!authorStateLoading && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      author
                        ? "bg-green-500/15 text-green-300"
                        : pendingClaim
                          ? "bg-yellow-500/15 text-yellow-300"
                          : rejectedClaim
                            ? "bg-red-500/15 text-red-300"
                            : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {author
                      ? author.pro
                        ? "Verificado · PRO"
                        : "Verificado"
                      : pendingClaim
                        ? "Pendiente"
                        : rejectedClaim
                          ? "Rechazado"
                          : "Sin página"}
                  </span>
                )}
              </div>

              {authorStateLoading ? (
                <p className="mt-5 text-sm text-zinc-400">
                  Cargando estado de autor...
                </p>
              ) : author ? (
                <div className="mt-5">
                  <div className="flex items-center gap-4">
                    {author.avatar && (
                      // El host de avatares depende del proyecto Supabase en ejecución.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="h-16 w-16 rounded-2xl border border-blue-500/20 object-cover"
                      />
                    )}
                    <p className="text-lg font-semibold">{author.name}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/authors/${author.slug}/edit`}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                    >
                      Editar mi página
                    </Link>
                    <Link
                      href={`/authors/${author.slug}`}
                      className="rounded-xl border border-blue-500/30 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/10"
                    >
                      Ver mi página
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-xl border border-blue-500/30 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/10"
                    >
                      Agregar uno de mis libros
                    </Link>
                  </div>

                  <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-sm font-medium text-blue-200">
                      Completa tu página de autor
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      Agrega tu sitio web, redes sociales, novedades y entrevista
                      para que los lectores conozcan mejor tu trabajo.
                    </p>
                  </div>

                  {author.pendingCoverCount > 0 && (
                    <div className="mt-3 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4">
                      <p className="text-sm font-medium text-yellow-200">
                        Actualiza las portadas de tus libros
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                        {author.pendingCoverCount === 1
                          ? "Tienes una portada pendiente de cargar o verificar."
                          : `Tienes ${author.pendingCoverCount} portadas pendientes de cargar o verificar.`}{" "}
                        Las que permanezcan pendientes podrán sustituirse más
                        adelante por una portada genérica.
                      </p>
                      <Link
                        href={`/authors/${author.slug}/edit`}
                        className="mt-3 inline-flex text-xs font-semibold text-yellow-200 hover:text-yellow-100"
                      >
                        Revisar portadas →
                      </Link>
                    </div>
                  )}
                </div>
              ) : pendingClaim ? (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Tu solicitud para {pendingClaim.authors?.name ?? "este autor"}
                    está pendiente de revisión.
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Enviada el{" "}
                    {new Date(pendingClaim.created_at).toLocaleDateString("es")}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex rounded-xl border border-blue-500/30 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/10"
                  >
                    Agregar uno de mis libros
                  </Link>
                </div>
              ) : rejectedClaim ? (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    La solicitud para {rejectedClaim.authors?.name ?? "este autor"}
                    fue rechazada. Puedes revisar el catálogo e iniciar otra
                    reclamación cuando corresponda.
                  </p>
                  <Link
                    href="/libros"
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                  >
                    Buscar en el catálogo
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Si tus libros ya aparecen en el catálogo, reclama tu autor.
                    Si todavía no están registrados, agrega uno para crear tu
                    espacio de autor.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/libros"
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                    >
                      Buscar mi libro
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-xl border border-blue-500/30 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/10"
                    >
                      Agregar uno de mis libros
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-auto border-t border-blue-500/15 pt-6">
                <Link
                  href="/tutorial/autores"
                  className="text-sm font-semibold text-blue-300 hover:text-blue-200"
                >
                  Ver tutorial para autores →
                </Link>
              </div>
            </article>
          </div>
        </section>

        {claims.length > 1 && (
          <details className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
            <summary className="cursor-pointer font-semibold">
              Historial de solicitudes de autor ({claims.length})
            </summary>
            <div className="mt-5 space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col gap-3 rounded-2xl bg-zinc-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {claim.authors?.name ?? "Autor sin nombre"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Solicitud del{" "}
                      {new Date(claim.created_at).toLocaleDateString("es")}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${claimStatusClasses(claim.status)}`}
                  >
                    {claimStatusLabel(claim.status)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        <section
          id="cuenta"
          className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Cuenta y seguridad
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Administra tus datos de acceso y tu sesión.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-5 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {editingUsername ? (
                <form onSubmit={saveUsername} className="max-w-md">
                  <label
                    htmlFor="account-username"
                    className="text-base font-semibold text-zinc-100"
                  >
                    Nombre de usuario
                  </label>
                  <div className="mt-2 flex rounded-xl border border-zinc-700 bg-zinc-800 focus-within:border-yellow-500">
                    <span className="flex items-center pl-4 text-zinc-500">@</span>
                    <input
                      id="account-username"
                      value={usernameDraft}
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{1,28}[a-zA-Z0-9]"
                      onChange={(event) =>
                        setUsernameDraft(event.target.value.toLowerCase())
                      }
                      className="min-w-0 flex-1 bg-transparent p-3 outline-none"
                      autoComplete="username"
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Puede mostrarse en tu página de autor si así lo eliges. No
                    cambia el usuario ni la URL de tu perfil lector.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={savingUsername}
                      className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {savingUsername ? "Guardando..." : "Guardar usuario"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUsername(false)
                        setUsernameError("")
                      }}
                      className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Nombre de usuario
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    @{savedUsername ?? profile?.username}
                  </p>
                </div>
              )}
              <p className="mt-1 break-all text-sm text-zinc-400">
                {user.email}
              </p>
              {usernameError && (
                <p className="mt-3 text-sm text-red-300" role="alert">
                  {usernameError}
                </p>
              )}
              {usernameNotice && (
                <p className="mt-3 text-sm text-green-300" role="status">
                  {usernameNotice}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {!editingUsername && (
                <button
                  type="button"
                  onClick={startUsernameEdit}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                >
                  Editar nombre de usuario
                </button>
              )}
              <button
                type="button"
                onClick={signOut}
                className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-red-300">
              Herramientas administrativas
            </h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={sendLaunchEmail}
                disabled={sendingLaunch || sendingClaimReminder}
                className="rounded-xl bg-red-600 px-5 py-3 font-medium transition hover:bg-red-500 disabled:opacity-50"
              >
                {sendingLaunch ? "Enviando..." : "Enviar anuncio"}
              </button>
              <button
                type="button"
                onClick={sendAuthorClaimReminder}
                disabled={sendingLaunch || sendingClaimReminder}
                className="rounded-xl bg-amber-600 px-5 py-3 font-medium transition hover:bg-amber-500 disabled:opacity-50"
              >
                {sendingClaimReminder
                  ? "Enviando..."
                  : "Recordar reclamación de autor"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/author-claims")}
                className="rounded-xl bg-green-600 px-5 py-3 font-medium transition hover:bg-green-500"
              >
                Panel de reclamaciones
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/tutorials")}
                className="rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500"
              >
                Editar tutoriales
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/author-pro")}
                className="rounded-xl bg-amber-600 px-5 py-3 font-medium transition hover:bg-amber-500"
              >
                Gestionar cortesías PRO
              </button>
            </div>
          </section>
        )}

        {isAdmin && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-red-400">
              Administración de usuarios
            </h2>
            <button
              type="button"
              onClick={loadUsers}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2"
            >
              Cargar usuarios
            </button>
            {loadingUsers && (
              <p className="mt-2 text-zinc-400">Cargando...</p>
            )}

            <div className="mt-4 space-y-2">
              {users.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl bg-zinc-900 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm">{item.username}</p>
                    <p className="text-xs text-zinc-500">{item.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteUser(item.id)}
                    className="w-full rounded-lg bg-red-600 px-3 py-2 sm:w-auto"
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
