import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, ExternalLink, LibraryBig, UserRound } from "lucide-react"
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"
import { SiThreads, SiTiktok, SiWattpad } from "react-icons/si"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import CoverImage from "@/components/CoverImage"
import { getBookCover } from "@/lib/amazon"
import { getPublicReaderLibrary } from "@/lib/readerLibrary"
import { getLinkedAuthorForPublicReader } from "@/lib/publicProfileLinks"
import PublicReaderLibrary from "@/components/readers/PublicReaderLibrary"
import PublicReaderFavorites from "@/components/readers/PublicReaderFavorites"
import ShareProfileButton from "@/components/ShareProfileButton"
import PublicReaderAchievements from "@/components/readers/PublicReaderAchievements"
import { getPublicReaderAchievements } from "@/lib/readerAchievements"

export const dynamic = "force-dynamic"

type ReaderProfile = {
  username: string
  display_name: string
  bio: string
  avatar_url: string
  instagram_url: string
  tiktok_url: string
  wattpad_url: string
  threads_url: string
  facebook_url: string
  youtube_url: string
  website_url: string
  is_public: boolean
  show_favorites: boolean
  show_achievements: boolean
}

// Se conserva la cuadrícula pública anterior como referencia mientras la nueva
// versión añade búsqueda y filtros sin cambiar los datos que recibe la página.
const useLegacyPublicLibrary = false

export default async function ReaderProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username: routeUsername } = await params
  const username = routeUsername.trim().toLowerCase()

  if (!/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(username)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: publicProfile, error } = await supabase
    .from("reader_profiles")
    .select(`
      username,
      display_name,
      bio,
      avatar_url,
      instagram_url,
      tiktok_url,
      wattpad_url,
      threads_url,
      facebook_url,
      youtube_url,
      website_url,
      is_public,
      show_favorites,
      show_achievements
    `)
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle()

  if (error) {
    notFound()
  }

  let profile = publicProfile as ReaderProfile | null
  let ownerUserId: string | undefined
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: ownedProfile, error: ownedProfileError } = await supabaseAdmin
      .from("reader_profiles")
      .select(`
        username,
        display_name,
        bio,
        avatar_url,
        instagram_url,
        tiktok_url,
        wattpad_url,
        threads_url,
        facebook_url,
        youtube_url,
        website_url,
        is_public,
        show_favorites,
        show_achievements
      `)
      .eq("username", username)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!ownedProfileError && ownedProfile) {
      profile = ownedProfile as ReaderProfile
      ownerUserId = user.id
    }
  }

  if (!profile) {
    notFound()
  }

  const isOwner = Boolean(ownerUserId)
  const isPrivatePreview = isOwner && !profile.is_public
  const showFavorites = isOwner || profile.show_favorites
  const showAchievements = isOwner || profile.show_achievements
  const hiddenPublicSections = [
    !profile.show_favorites ? "tus favoritos" : null,
    !profile.show_achievements ? "tus logros" : null,
  ].filter((section): section is string => Boolean(section))
  const [library, linkedAuthor, achievements] = await Promise.all([
    getPublicReaderLibrary(username, showFavorites, ownerUserId),
    getLinkedAuthorForPublicReader(username, ownerUserId),
    showAchievements
      ? getPublicReaderAchievements(username, ownerUserId)
      : Promise.resolve([]),
  ])
  const readCount = library.filter((item) => item.isRead).length
  const links = [
    profile.instagram_url
      ? {
          label: "Instagram",
          href: profile.instagram_url,
          icon: <FaInstagram aria-hidden="true" />,
          iconClassName: "text-pink-400",
        }
      : null,
    profile.tiktok_url
      ? {
          label: "TikTok",
          href: profile.tiktok_url,
          icon: <SiTiktok aria-hidden="true" />,
          iconClassName: "text-cyan-300",
        }
      : null,
    profile.wattpad_url
      ? {
          label: "Wattpad",
          href: profile.wattpad_url,
          icon: <SiWattpad aria-hidden="true" />,
          iconClassName: "text-orange-400",
        }
      : null,
    profile.threads_url
      ? {
          label: "Threads",
          href: profile.threads_url,
          icon: <SiThreads aria-hidden="true" />,
          iconClassName: "text-zinc-100",
        }
      : null,
    profile.facebook_url
      ? {
          label: "Facebook",
          href: profile.facebook_url,
          icon: <FaFacebook aria-hidden="true" />,
          iconClassName: "text-blue-400",
        }
      : null,
    profile.youtube_url
      ? {
          label: "YouTube",
          href: profile.youtube_url,
          icon: <FaYoutube aria-hidden="true" />,
          iconClassName: "text-red-400",
        }
      : null,
    profile.website_url
      ? {
          label: "Sitio web",
          href: profile.website_url,
          icon: <ExternalLink size={16} aria-hidden="true" />,
          iconClassName: "text-yellow-400",
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string
    href: string
    icon: React.ReactNode
    iconClassName: string
  }>

  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        {isPrivatePreview && (
          <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Vista privada: puedes ver este perfil porque es tuyo, pero todavía
            no está disponible para otras personas.
          </div>
        )}
        {isOwner && profile.is_public && hiddenPublicSections.length > 0 && (
          <div className="mb-5 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            Vista de propietario: puedes ver todo tu perfil. El público no puede
            ver {hiddenPublicSections.join(" ni ")}.
          </div>
        )}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-500/15 bg-gradient-to-br from-blue-950 via-slate-950 to-zinc-950 shadow-2xl shadow-black/30">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />
          {profile.is_public && (
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <ShareProfileButton
                path={`/readers/${profile.username}`}
                backgroundColor="#eab308"
                textColor="#18181b"
                iconOnly
              />
            </div>
          )}

          <div className="relative flex min-h-[310px] flex-col items-center justify-end gap-5 px-5 py-9 text-center sm:px-8 sm:py-11 lg:flex-row lg:items-end lg:gap-8 lg:px-10 lg:text-left">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-yellow-500/50 bg-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,.45)] sm:h-36 sm:w-36 lg:h-40 lg:w-40 lg:rounded-[2rem]">
                {profile.avatar_url ? (
                  // Reader avatars come from the installation's runtime Supabase host.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${profile.display_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-14 w-14 text-yellow-500/60 sm:h-16 sm:w-16" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="max-w-full break-all text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {profile.display_name}
                </h1>

              <div className="mt-5 space-y-3">
                {links.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                      {links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-900/75 px-2.5 py-1.5 text-xs font-medium text-zinc-200 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800 sm:px-3 sm:py-2 sm:text-sm"
                        >
                          <span className={`text-base leading-none ${link.iconClassName}`}>
                            {link.icon}
                          </span>
                          {link.label}
                        </a>
                      ))}
                    </div>
                )}
                <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  {linkedAuthor && (
                    <Link
                      href={`/authors/${linkedAuthor.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/25 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200 transition hover:border-blue-300/50 hover:bg-blue-500/15 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <BookOpen size={16} aria-hidden="true" />
                      Página de autor: {linkedAuthor.name}
                    </Link>
                  )}
                </div>
              </div>
              </div>
          </div>
        </section>

        {profile.bio && (
          <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-6 sm:p-9">
            <div className="flex items-center gap-3">
              <div className="h-9 w-1.5 rounded-full bg-yellow-500" />
              <h2 className="text-2xl font-semibold">Sobre este lector</h2>
            </div>
            <p className="mt-5 max-w-3xl whitespace-pre-wrap leading-8 text-zinc-300">
              {profile.bio}
            </p>
          </section>
        )}

        <PublicReaderAchievements achievements={achievements} />

        {showFavorites && (
          <PublicReaderFavorites library={library} />
        )}

        <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-6 sm:p-9">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
              <LibraryBig aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Biblioteca personal</h2>
              <p className="text-sm text-zinc-500">
                {library.length} {library.length === 1 ? "libro" : "libros"} · {readCount} {readCount === 1 ? "leído" : "leídos"}
              </p>
            </div>
          </div>

          {useLegacyPublicLibrary ? (library.length === 0 ? (
            <p className="mt-6 max-w-2xl text-zinc-400">
              Esta biblioteca todavía no tiene libros.
            </p>
          ) : (
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {library.map(({ book, isRead }) => (
                <Link
                  key={book.id}
                  href={`/libros/${book.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
                    <CoverImage
                      src={getBookCover(book.amazon, book.cover)}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                    <span
                      className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-lg ${
                        isRead
                          ? "bg-green-500 text-white"
                          : "bg-zinc-900/90 text-zinc-200"
                      }`}
                    >
                      {isRead ? "Leído" : "Pendiente"}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-zinc-200 group-hover:text-yellow-300">
                    {book.title}
                  </h3>
                </Link>
              ))}
            </div>
          )) : (
            <PublicReaderLibrary library={library} />
          )}

          {/* El texto provisional anterior se sustituyó por la biblioteca real.
              Esta nota conserva el motivo del cambio de etapa. */}
        </section>

        <div className="mt-8 text-center">
          <Link href="/book-directory" className="text-sm text-yellow-400 hover:text-yellow-300">
            Explorar biblioteca indie
          </Link>
        </div>
      </div>
    </main>
  )
}
