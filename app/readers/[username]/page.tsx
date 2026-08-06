import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, ExternalLink, LibraryBig, UserRound } from "lucide-react"
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa"
import { SiThreads, SiTiktok, SiWattpad } from "react-icons/si"
import { createClient } from "@/lib/supabase-server"
import CoverImage from "@/components/CoverImage"
import { getBookCover } from "@/lib/amazon"
import { getPublicReaderLibrary } from "@/lib/readerLibrary"
import { getLinkedAuthorForPublicReader } from "@/lib/publicProfileLinks"
import PublicReaderLibrary from "@/components/readers/PublicReaderLibrary"

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
  const { data, error } = await supabase
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
      website_url
    `)
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  const profile = data as ReaderProfile
  const [library, linkedAuthor] = await Promise.all([
    getPublicReaderLibrary(username),
    getLinkedAuthorForPublicReader(username),
  ])
  const readCount = library.filter((item) => item.isRead).length
  const links = [
    profile.instagram_url
      ? {
          label: "Instagram",
          href: profile.instagram_url,
          icon: <FaInstagram aria-hidden="true" />,
          className:
            "border-pink-500/30 bg-pink-500/10 text-pink-200 hover:border-pink-400/60 hover:bg-pink-500/15",
        }
      : null,
    profile.tiktok_url
      ? {
          label: "TikTok",
          href: profile.tiktok_url,
          icon: <SiTiktok aria-hidden="true" />,
          className:
            "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-400/15",
        }
      : null,
    profile.wattpad_url
      ? {
          label: "Wattpad",
          href: profile.wattpad_url,
          icon: <SiWattpad aria-hidden="true" />,
          className:
            "border-orange-500/30 bg-orange-500/10 text-orange-200 hover:border-orange-400/60 hover:bg-orange-500/15",
        }
      : null,
    profile.threads_url
      ? {
          label: "Threads",
          href: profile.threads_url,
          icon: <SiThreads aria-hidden="true" />,
          className:
            "border-zinc-600 bg-zinc-800 text-zinc-100 hover:border-zinc-400 hover:bg-zinc-700",
        }
      : null,
    profile.facebook_url
      ? {
          label: "Facebook",
          href: profile.facebook_url,
          icon: <FaFacebook aria-hidden="true" />,
          className:
            "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:border-blue-400/60 hover:bg-blue-500/15",
        }
      : null,
    profile.youtube_url
      ? {
          label: "YouTube",
          href: profile.youtube_url,
          icon: <FaYoutube aria-hidden="true" />,
          className:
            "border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-400/60 hover:bg-red-500/15",
        }
      : null,
    profile.website_url
      ? {
          label: "Sitio web",
          href: profile.website_url,
          icon: <ExternalLink size={16} aria-hidden="true" />,
          className:
            "border-yellow-500/30 bg-yellow-500/10 text-yellow-200 hover:border-yellow-400/60 hover:bg-yellow-500/15",
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string
    href: string
    icon: React.ReactNode
    className: string
  }>

  return (
    <main className="min-h-screen px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/30">
          <div className="h-32 bg-gradient-to-r from-yellow-500/25 via-amber-400/10 to-zinc-900 sm:h-40" />

          <div className="px-5 pb-8 sm:px-10">
            <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-zinc-900 bg-zinc-800 shadow-xl sm:h-40 sm:w-40">
                {profile.avatar_url ? (
                  // Reader avatars come from the installation's runtime Supabase host.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${profile.display_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-16 w-16 text-zinc-500" />
                )}
              </div>

              <div className="pb-1">
                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {profile.display_name}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">@{profile.username}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-7 max-w-2xl whitespace-pre-wrap leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
            )}

            {(links.length > 0 || linkedAuthor) && (
              <div className="mt-7 space-y-4">
                {links.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-zinc-400">Enlaces</h2>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium shadow-sm transition ${link.className}`}
                        >
                          <span className="text-lg leading-none">{link.icon}</span>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {linkedAuthor && (
                  <Link
                    href={`/authors/${linkedAuthor.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-sm font-medium text-blue-200 transition hover:border-blue-400/60 hover:bg-blue-500/15"
                  >
                    <BookOpen size={16} aria-hidden="true" />
                    Página de autor: {linkedAuthor.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

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
