"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"
import { Camera, Download, ExternalLink, UserRound } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchAvatarCopy } from "@/lib/avatarImport"

type ReaderProfileForm = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  instagramUrl: string
  tiktokUrl: string
  wattpadUrl: string
  threadsUrl: string
  facebookUrl: string
  youtubeUrl: string
  websiteUrl: string
  isPublic: boolean
  showFavorites: boolean
  showAchievements: boolean
}

type AuthorProfileImport = {
  name: string
  avatarUrl: string
  instagramUrl: string
  tiktokUrl: string
  wattpadUrl: string
  threadsUrl: string
  facebookUrl: string
  youtubeUrl: string
  websiteUrl: string
}

const EMPTY_PROFILE: ReaderProfileForm = {
  username: "",
  displayName: "",
  bio: "",
  avatarUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  wattpadUrl: "",
  threadsUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  isPublic: false,
  showFavorites: true,
  showAchievements: true,
}

export default function ReaderProfileEditorPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ReaderProfileForm>(EMPTY_PROFILE)
  const [hasReaderProfile, setHasReaderProfile] = useState(false)
  const [confirmedPermanentUsername, setConfirmedPermanentUsername] =
    useState(false)
  const [authorProfile, setAuthorProfile] = useState<AuthorProfileImport | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importingAuthorProfile, setImportingAuthorProfile] = useState(false)
  const [message, setMessage] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const response = await fetch("/api/readers/profile", {
        cache: "no-store",
      })

      if (response.status === 401) {
        router.replace("/login")
        return
      }

      const result = await response.json()

      if (!active) return

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo cargar el perfil")
        setLoading(false)
        return
      }

      setProfile(result.profile)
      setHasReaderProfile(result.hasReaderProfile === true)
      setAuthorProfile(result.authorProfile ?? null)
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [router])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("")
      return
    }

    const preview = URL.createObjectURL(avatarFile)
    setAvatarPreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [avatarFile])

  function updateField<K extends keyof ReaderProfileForm>(
    field: K,
    value: ReaderProfileForm[K]
  ) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function normalizeUrl(url: string) {
    const value = url.trim()

    if (!value || /^https?:\/\//i.test(value)) return value

    return `https://${value}`
  }

  async function importAuthorProfile() {
    if (!authorProfile) return

    setImportingAuthorProfile(true)
    setMessage("")
    setNotice("")

    setProfile((current) => ({
      ...current,
      // Se comenta la asignación directa anterior porque compartía la misma
      // ruta y borrar una foto podía afectar al otro perfil.
      // avatarUrl: authorProfile.avatarUrl || current.avatarUrl,
      instagramUrl: authorProfile.instagramUrl || current.instagramUrl,
      tiktokUrl: authorProfile.tiktokUrl || current.tiktokUrl,
      wattpadUrl: authorProfile.wattpadUrl || current.wattpadUrl,
      threadsUrl: authorProfile.threadsUrl || current.threadsUrl,
      facebookUrl: authorProfile.facebookUrl || current.facebookUrl,
      youtubeUrl: authorProfile.youtubeUrl || current.youtubeUrl,
      websiteUrl: authorProfile.websiteUrl || current.websiteUrl,
    }))

    try {
      if (authorProfile.avatarUrl) {
        const copiedAvatar = await fetchAvatarCopy("author")
        setAvatarFile(copiedAvatar)
      }

      setNotice(
        authorProfile.avatarUrl
          ? "Foto y enlaces importados. Revísalos y guarda el perfil para confirmar los cambios."
          : "Enlaces importados. La página de autor no tiene una foto para copiar."
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `${error.message}. Los enlaces sí se cargaron en el formulario.`
          : "No se pudo importar la foto. Los enlaces sí se cargaron en el formulario."
      )
    } finally {
      setImportingAuthorProfile(false)
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return profile.avatarUrl

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Tu sesion termino. Inicia sesion de nuevo.")

    const compressed = await imageCompression(avatarFile, {
      maxWidthOrHeight: 600,
      maxSizeMB: 0.7,
      useWebWorker: true,
      fileType: "image/webp",
    })
    const path = `${user.id}/avatar.webp`
    const { error } = await supabase.storage
      .from("reader-avatars")
      .upload(path, compressed, {
        contentType: "image/webp",
        upsert: true,
      })

    if (error) {
      throw new Error("No se pudo subir la imagen")
    }

    const { data } = supabase.storage
      .from("reader-avatars")
      .getPublicUrl(path)

    return `${data.publicUrl}?v=${Date.now()}`
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasReaderProfile && !confirmedPermanentUsername) {
      setMessage("Confirma que entiendes que la dirección del perfil no podrá cambiarse.")
      return
    }

    setSaving(true)
    setMessage("")
    setNotice("")

    try {
      const avatarUrl = await uploadAvatar()
      const normalizedProfile = {
        ...profile,
        instagramUrl: normalizeUrl(profile.instagramUrl),
        tiktokUrl: normalizeUrl(profile.tiktokUrl),
        wattpadUrl: normalizeUrl(profile.wattpadUrl),
        threadsUrl: normalizeUrl(profile.threadsUrl),
        facebookUrl: normalizeUrl(profile.facebookUrl),
        youtubeUrl: normalizeUrl(profile.youtubeUrl),
        websiteUrl: normalizeUrl(profile.websiteUrl),
      }
      const response = await fetch("/api/readers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...normalizedProfile,
          avatarUrl,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error ?? "No se pudo guardar el perfil")
        return
      }

      if (result.warning) {
        setMessage(result.warning)
        return
      }

      router.refresh()
      router.push("/me")
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el perfil"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Cargando perfil...
      </div>
    )
  }

  const visibleAvatar = avatarPreview || profile.avatarUrl

  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/*<p className="text-sm font-medium uppercase tracking-[0.2em] text-yellow-400">
              Perfil de lector
            </p>*/}
            <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
              Tu espacio público
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Comparte quién eres como lector. Tu correo y la información de tu cuenta nunca aparecen aquí.
            </p>
          </div>

          {profile.isPublic && profile.username && (
            <Link
              href={`/readers/${profile.username}`}
              className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
            >
              Ver perfil
              <ExternalLink size={15} />
            </Link>
          )}
        </div>

        <form onSubmit={saveProfile} className="space-y-6">
          <section className="rounded-3xl border border-yellow-500/25 bg-yellow-500/5 p-5 sm:p-7">
            {hasReaderProfile ? (
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Dirección permanente
                </p>
                <p className="mt-2 break-all text-lg font-semibold text-yellow-300">
                  /readers/{profile.username}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Esta dirección no puede cambiarse, pero tu nombre visible sí
                  se puede editar abajo.
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="reader-username"
                  className="text-sm font-medium text-zinc-200"
                >
                  Elige la dirección de tu perfil
                </label>
                <div className="mt-2 flex rounded-xl border border-zinc-700 bg-zinc-800 focus-within:border-yellow-500">
                  <span className="flex items-center pl-4 text-zinc-500">/readers/</span>
                  <input
                    id="reader-username"
                    value={profile.username}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{1,28}[a-zA-Z0-9]"
                    onChange={(event) =>
                      updateField("username", event.target.value.toLowerCase())
                    }
                    className="min-w-0 flex-1 bg-transparent p-3 outline-none"
                    autoComplete="username"
                    aria-describedby="reader-username-help"
                  />
                </div>
                <p
                  id="reader-username-help"
                  className="mt-3 text-sm leading-relaxed text-yellow-200/80"
                >
                  Ésta será la dirección para compartir tu perfil. Elígela con
                  cuidado: una vez creado no podrás cambiarla.
                </p>
                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={confirmedPermanentUsername}
                    required
                    onChange={(event) =>
                      setConfirmedPermanentUsername(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-yellow-500"
                  />
                  <span className="text-sm text-zinc-300">
                    Entiendo que la dirección de mi perfil será permanente.
                  </span>
                </label>
              </div>
            )}
          </section>

          {authorProfile && (
            <section className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-blue-200">
                    Importar desde tu página de autor
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                    Usa el avatar y los enlaces disponibles de {authorProfile.name || "tu perfil de autor"} como punto de partida. Podrás revisarlos antes de guardar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={importAuthorProfile}
                  disabled={importingAuthorProfile}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-60"
                >
                  <Download size={18} />
                  {importingAuthorProfile
                    ? "Importando..."
                    : "Usar foto y enlaces de mi página de autor"}
                </button>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800">
                {visibleAvatar ? (
                  // The image host is the runtime Supabase project selected by this installation.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={visibleAvatar}
                    alt="Vista previa del avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-12 w-12 text-zinc-500" />
                )}
              </div>

              <div>
                <label
                  htmlFor="reader-avatar"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 font-medium text-zinc-900 transition hover:bg-white"
                >
                  <Camera size={18} />
                  Elegir avatar
                </label>
                <input
                  id="reader-avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null

                    if (file && file.size > 5 * 1024 * 1024) {
                      setMessage("La imagen original no puede superar 5 MB")
                      event.target.value = ""
                      return
                    }

                    setAvatarFile(file)
                  }}
                />
                <p className="mt-2 text-xs text-zinc-500">
                  JPG, PNG o WebP. La imagen se optimiza antes de subirla.
                </p>
                {visibleAvatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null)
                      updateField("avatarUrl", "")
                      setNotice("El avatar se eliminará cuando guardes el perfil.")
                    }}
                    className="mt-3 text-sm text-red-300 hover:text-red-200"
                  >
                    Quitar avatar
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7">
            <div>
              <label htmlFor="display-name" className="text-sm font-medium text-zinc-200">
                Nombre visible
              </label>
              <input
                id="display-name"
                value={profile.displayName}
                required
                maxLength={60}
                onChange={(event) => updateField("displayName", event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-yellow-500"
                placeholder="Cómo quieres que te conozcan"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="bio" className="text-sm font-medium text-zinc-200">
                  Biografía
                </label>
                <span className="text-xs text-zinc-500">{profile.bio.length}/240</span>
              </div>
              <textarea
                id="bio"
                value={profile.bio}
                maxLength={240}
                rows={5}
                onChange={(event) => updateField("bio", event.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-yellow-500"
                placeholder="Cuéntanos qué te gusta leer"
              />
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold">Enlaces</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Son opcionales y solo se mostrarán si publicas tu perfil. Puedes
                omitir <span className="font-medium text-zinc-300">https://</span>;
                lo completaremos al guardar.
              </p>
            </div>

            {([
              ["instagramUrl", "Instagram", "https://instagram.com/tu_usuario"],
              ["tiktokUrl", "TikTok", "https://tiktok.com/@tu_usuario"],
              ["wattpadUrl", "Wattpad", "https://wattpad.com/user/tu_usuario"],
              ["threadsUrl", "Threads", "https://threads.net/@tu_usuario"],
              ["facebookUrl", "Facebook", "https://facebook.com/tu_usuario"],
              ["youtubeUrl", "YouTube", "https://youtube.com/@tu_canal"],
              ["websiteUrl", "Sitio web", "https://tusitio.com"],
            ] as const).map(([field, label, placeholder]) => (
              <div key={field}>
                <label htmlFor={field} className="text-sm font-medium text-zinc-200">
                  {label}
                </label>
                <input
                  id={field}
                  type="text"
                  inputMode="url"
                  value={profile[field]}
                  maxLength={500}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-yellow-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </section>

          <section className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7">
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                checked={profile.isPublic}
                onChange={(event) => updateField("isPublic", event.target.checked)}
                className="mt-1 h-5 w-5 accent-yellow-500"
              />
              <span>
                <span className="block font-semibold">Publicar mi perfil</span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                  Al activarlo, cualquier persona podrá visitar tu perfil mediante su URL. Puedes volver a ocultarlo cuando quieras.
                </span>
              </span>
            </label>

            <div className="border-t border-zinc-800 pt-5">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={profile.showFavorites}
                  onChange={(event) =>
                    updateField("showFavorites", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 accent-rose-500"
                />
                <span>
                  <span className="block font-semibold">
                    Mostrar mis favoritos en mi perfil público
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                    Si lo desactivas, tus favoritos seguirán guardados y solo
                    tú podrás verlos en tu biblioteca.
                  </span>
                </span>
              </label>
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={profile.showAchievements}
                  onChange={(event) =>
                    updateField("showAchievements", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 accent-amber-500"
                />
                <span>
                  <span className="block font-semibold">
                    Mostrar mis logros en mi perfil público
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                    Solo se mostrarán hasta tres medallas. El resto de tu avance
                    seguirá siendo privado.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {message && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
            >
              {message}
            </p>
          )}

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
            >
              {notice}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/me")}
              className="rounded-xl bg-zinc-800 px-5 py-3 font-medium transition hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (!hasReaderProfile && !confirmedPermanentUsername)}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
