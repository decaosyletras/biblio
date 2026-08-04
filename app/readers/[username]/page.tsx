import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, ExternalLink, LibraryBig, UserRound } from "lucide-react"
import { FaInstagram } from "react-icons/fa"
import { SiTiktok } from "react-icons/si"
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
        }
      : null,
    profile.tiktok_url
      ? {
          label: "TikTok",
          href: profile.tiktok_url,
          icon: <SiTiktok aria-hidden="true" />,
        }
      : null,
    profile.website_url
      ? {
          label: "Sitio web",
          href: profile.website_url,
          icon: <ExternalLink size={16} aria-hidden="true" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string
    href: string
    icon: React.ReactNode
  }>

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black px-4 py-14 text-white sm:px-6">
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
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.display_name}
                </h1>
                <p className="mt-1 text-zinc-400">@{profile.username}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-7 max-w-2xl whitespace-pre-wrap leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
            )}

            {(links.length > 0 || linkedAuthor) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm transition hover:border-yellow-500/60 hover:text-yellow-300"
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
                {linkedAuthor && (
                  <Link
                    href={`/authors/${linkedAuthor.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm transition hover:border-yellow-500/60 hover:text-yellow-300"
                  >
                    <BookOpen size={16} aria-hidden="true" />
                    Ver página de autor
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
