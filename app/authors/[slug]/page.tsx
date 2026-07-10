import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import GenreBadge from "@/components/GenreBadge"
import { genresCatalog } from "@/data/genres"
import { getBookCover } from "@/lib/amazon"
import CoverImage from "@/components/CoverImage"
import AmazonButton from "@/components/AmazonButton"
import { FaCrown } from "react-icons/fa"
import ProCheckoutButton from "@/components/ProCheckoutButton"
import { cookies } from "next/headers"

import {
    FaInstagram,
    FaFacebook,
    FaYoutube,
    FaGlobe
} from "react-icons/fa"
import {
    SiTiktok,
    SiThreads
} from "react-icons/si"
export const dynamic = "force-dynamic"

const themes = {
    zinc: {
        background: "from-zinc-950 via-zinc-950 to-black",
        card: "bg-zinc-900/60"
    },
    emerald: {
        background: "from-emerald-950 via-zinc-950 to-black",
        card: "bg-emerald-950/30"
    },
    rose: {
        background: "from-rose-950 via-zinc-950 to-black",
        card: "bg-rose-950/30"
    },
    blue: {
        background: "from-blue-950 via-zinc-950 to-black",
        card: "bg-blue-950/30"
    }
}

const primaryColors = {
    blue: "bg-blue-600 hover:bg-blue-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500",
    rose: "bg-rose-600 hover:bg-rose-500"
}

export default async function AuthorPage({
    params
}: {
    params: { slug: string } | Promise<{ slug: string }>
}) {

    const supabase = await createClient()

    const { slug } = await params

    const { data: author } = await supabase
        .from("authors")
        .select("*")
        .eq("slug", slug)
        .single()

    if (!author) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                Autor no encontrado
            </div>
        )
    }

    let username: string | null = null

    const { data: approvedClaim } = await supabase
        .from("author_claims")
        .select("user_id")
        .eq("author_id", author.id)
        .eq("status", "approved")
        .maybeSingle()

    if (approvedClaim?.user_id) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", approvedClaim.user_id)
            .maybeSingle()

        username = profile?.username ?? null
    }

    const { data } = await supabase.auth.getUser()

    const user = data.user ?? null

    let canEdit = false

    const { data: claimsDebug } = await supabase
        .from("author_claims")
        .select("*")
        .eq("author_id", author.id)

    if (user) {
        const { data: claim } = await supabase
            .from("author_claims")
            .select("id")
            .eq("author_id", author.id)
            .eq("user_id", user.id)
            .eq("status", "approved")
            .maybeSingle()

        canEdit = !!claim
    }

    const isPro = author.pro === true

    let featuredBook = null

    if (author.featured_book_id) {
        const { data } = await supabase
            .from("books")
            .select("*")
            .eq("id", author.featured_book_id)
            .single()

        featuredBook = data
    }

    const { data: directBooks } = await supabase
        .from("books")
        .select("*")
        .eq("author_id", author.id)
        .eq("approved", true)

    const { data: relationBooks } = await supabase
        .from("book_authors")
        .select(`
            books(*)
        `)
        .eq("author_id", author.id)

    const multiBooks =
        relationBooks
            ?.map(x => x.books)
            .filter(Boolean) ?? []

    const booksMap = new Map()

        ;[
            ...(directBooks ?? []),
            ...multiBooks
        ].forEach(book => {
            booksMap.set(book.id, book)
        })

    const books = Array
        .from(booksMap.values())
        .sort(
            (a, b) =>
                (a.author_order ?? 0) - (b.author_order ?? 0)
        )

    const theme =
        themes[
        (author.theme?.background ?? "zinc") as keyof typeof themes
        ] ?? themes.zinc

    const primary =
        primaryColors[
        (author.theme?.primary ?? "blue") as keyof typeof primaryColors
        ] ?? primaryColors.blue

    const customSurface =
        author.theme?.surface ?? "#18181b"

    const authorTheme = {
        bg: author.theme?.bg ?? "#09090b",
        surface: author.theme?.surface ?? "#18181b",
        primary: author.theme?.primary ?? "#2563eb",
        text: author.theme?.text ?? "#ffffff",
        muted: author.theme?.muted ?? "#a1a1aa",
        border: author.theme?.border ?? "#27272a",
    }

    /*onsole.log({
        user: user?.id,
        author: author.id,
        pro: author.pro,
        canEdit
    })*/

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: author.theme?.bg ?? "#09090b",
                color: author.theme?.text ?? "#ffffff",
                fontFamily:
                    author.theme?.font === "serif"
                        ? "Georgia, serif"
                        : author.theme?.font === "mono"
                            ? "ui-monospace, monospace"
                            : "ui-sans-serif, sans-serif"
            }}
        >

            <section className="relative overflow-hidden">

                {/* Fondo */}
                {isPro && author.banner ? (
                    <>
                        <img
                            src={author.banner}
                            className="absolute inset-0 w-full h-[420px] object-cover opacity-25"
                        />

                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-zinc-950/60 to-zinc-950" />
                    </>
                ) : (
                    <>
                        <div
                            className={`
                    absolute inset-0 h-[420px]
                    bg-gradient-to-br ${theme.background}
                `}
                        />

                        <div className="absolute -top-28 -left-24 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
                        <div className="absolute top-10 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl" />
                    </>
                )}

                <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-10">

                    <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-end">

                        {/* Avatar */}

                        <div className="relative shrink-0">

                            <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/30 to-transparent blur-xl opacity-70" />

                            <img
                                src={author.avatar}
                                className="relative w-28 h-28 md:w-40 md:h-40 rounded-[28px] object-cover border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,.45)] "
                            />

                        </div>

                        {/* Información */}

                        <div className="flex-1 text-center lg:text-left lg:pb-2">

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">

                                <h1
                                    className="text-3xl md:text-4xl font-bold tracking-tight"
                                    style={{
                                        color: authorTheme.text
                                    }}
                                >
                                    {author.name}
                                </h1>

                                {isPro && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold">
                                        PRO
                                    </span>
                                )}

                            </div>

                            <div className="mt-5 flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-2 text-sm">

                                {username && (
                                    <>
                                        <span className="font-medium text-zinc-200">
                                            @{username}
                                        </span>

                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                    </>
                                )}

                                <span
                                    style={{
                                        color: authorTheme.primary
                                    }}
                                >
                                    {author.style || "Autor independiente"}
                                </span>

                                <span className="w-1 h-1 rounded-full bg-zinc-600" />

                                <span
                                    style={{
                                        color: authorTheme.muted
                                    }}
                                >
                                    {books.length} {books.length === 1 ? "libro publicado" : "libros publicados"}
                                </span>

                            </div>

                            {/* Redes */}

                            {isPro && (
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8">

                                    {author.instagram && (
                                        <a
                                            href={author.instagram}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-pink-500 hover:bg-pink-500/10 transition-all"
                                        >
                                            <FaInstagram className="text-pink-400" />
                                        </a>
                                    )}

                                    {author.tiktok && (
                                        <a
                                            href={author.tiktok}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-white transition-all"
                                        >
                                            <SiTiktok />
                                        </a>
                                    )}

                                    {author.threads && (
                                        <a
                                            href={author.threads}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-cyan-400 hover:bg-cyan-500/10 transition-all"
                                        >
                                            <SiThreads className="text-cyan-400" />
                                        </a>
                                    )}

                                    {author.facebook && (
                                        <a
                                            href={author.facebook}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-blue-500 transition-all"
                                        >
                                            <FaFacebook className="text-blue-500" />
                                        </a>
                                    )}

                                    {author.youtube && (
                                        <a
                                            href={author.youtube}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <FaYoutube className="text-red-500" />
                                        </a>
                                    )}

                                    {author.website && (
                                        <a
                                            href={author.website}
                                            target="_blank"
                                            className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-all"
                                        >
                                            <FaGlobe className="text-blue-400" />
                                        </a>
                                    )}

                                </div>
                            )}

                        </div>

                        {canEdit && (
                            <div className="flex flex-col sm:flex-row gap-3">

                                {!author.pro && (
                                    <ProCheckoutButton
                                        authorId={author.id}
                                    />
                                )}

                                <Link
                                    href={`/authors/${author.slug}/edit`}
                                    className="
                                        px-5 py-3 rounded-xl
                                        text-white
                                        transition
                                        whitespace-nowrap
                                    "
                                    style={{
                                        backgroundColor: author.theme?.primary ?? "#2563eb"
                                    }}
                                >
                                    Editar perfil
                                </Link>

                            </div>
                        )}

                    </div>

                </div>

            </section>
            <main className="max-w-5xl mx-auto px-6 pb-16 space-y-8">

                {/*(author.description || author.bio) && (
                    <section className={`
                        ${theme.card}
                        border border-zinc-800
                        rounded-3xl p-6 md:p-8
                    `}>
                        <h2 className="text-xl font-bold mb-4">
                            Sobre el autor
                        </h2>

                        <p className="
                            text-zinc-300
                            leading-relaxed
                            whitespace-pre-line
                        ">
                            {author.description || author.bio}
                        </p>
                    </section>
                )*/}


                {author.bio && (
                    <section
                        className="rounded-3xl p-7 md:p-10 backdrop-blur-sm"
                        style={{
                            backgroundColor: authorTheme.surface,
                            border: `1px solid ${authorTheme.border}`
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-1.5 h-8 rounded-full"
                                style={{
                                    backgroundColor: authorTheme.primary
                                }}
                            />
                            <div>
                                <p
                                    className="text-xs uppercase tracking-[0.35em]"
                                    style={{
                                        color: authorTheme.muted
                                    }}
                                >
                                    Autor
                                </p>

                                <h2
                                    className="text-2xl font-bold"
                                    style={{
                                        color: authorTheme.text
                                    }}
                                >
                                    Biografía
                                </h2>
                            </div>
                        </div>
                        <p
                            className="whitespace-pre-line leading-8 text-[15px]"
                            style={{
                                color: author.theme?.text ?? "#ffffff"
                            }}
                        >
                            {author.bio}
                        </p>
                    </section>
                )}

                {isPro && author.current_news && (
                    <section
                        className="rounded-3xl p-7 md:p-8"
                        style={{
                            backgroundColor: authorTheme.surface,
                            border: `1px solid ${authorTheme.border}`
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                style={{
                                    backgroundColor: `${authorTheme.primary}20`
                                }}
                            >
                                📰
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">
                                    Actualidad
                                </p>
                                <h2
                                    className="text-2xl font-bold"
                                    style={{
                                        color: authorTheme.primary
                                    }}
                                >
                                    Últimas noticias
                                </h2>
                            </div>
                        </div>
                        <div
                            className="mt-6 whitespace-pre-line leading-8"
                            style={{
                                color: authorTheme.text
                            }}
                        >
                            {author.current_news}
                        </div>

                    </section>
                )}

                {featuredBook && (
                    <section
                        className="rounded-3xl p-6 md:p-8"
                        style={{
                            backgroundColor: authorTheme.surface,
                            border: `1px solid ${authorTheme.border}`
                        }}
                    >

                        <h2
                            className="text-xl md:text-2xl font-bold mb-6"
                            style={{
                                color: authorTheme.text
                            }}
                        >
                            Libro destacado
                        </h2>


                        <div className="flex flex-col sm:flex-row gap-6 items-center group" >
                            <>
                                <div className="w-40 aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl">
                                    <CoverImage
                                        src={getBookCover(
                                            {
                                                es: featuredBook.asin_es,
                                                mx: featuredBook.asin_mx,
                                                us: featuredBook.asin_us
                                            },
                                            featuredBook.cover
                                        )}
                                        alt={featuredBook.title}
                                        className="
                                            w-full
                                            h-full
                                            object-cover
                                            transition
                                            duration-500
                                        "
                                    />
                                </div>

                                <div className="flex-1">

                                    <h3
                                        className="text-3xl font-black"
                                        style={{
                                            color: authorTheme.text
                                        }}
                                    >
                                        {featuredBook.title}
                                    </h3>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(featuredBook.genres ?? []).map((id: string) => {
                                            const genre = genresCatalog.find(
                                                g => g.id === id
                                            )
                                            if (!genre) return null

                                            return (
                                                <GenreBadge
                                                    key={genre.id}
                                                    label={genre.label}
                                                    type={genre.id}
                                                    theme={authorTheme}
                                                />
                                            )
                                        })}
                                        <span
                                            className={
                                                featuredBook.is_saga
                                                    ? "text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                    : "text-xs px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400"
                                            }
                                        >
                                            {featuredBook.is_saga
                                                ? "📚 Saga"
                                                : "📖 Autoconclusivo"}
                                        </span>
                                    </div>
                                    {featuredBook.summary && (

                                        <p
                                            className="mt-5 leading-7 line-clamp-4"
                                            style={{
                                                color: authorTheme.muted
                                            }}
                                        >
                                            {featuredBook.summary}
                                        </p>

                                    )}

                                    <div className="mt-2 flex flex-wrap gap-3 items-center">

                                        <AmazonButton
                                            amazon={{
                                                es: featuredBook.asin_es,
                                                mx: featuredBook.asin_mx,
                                                us: featuredBook.asin_us
                                            }}
                                            amazonLink={featuredBook.amazonLink}
                                            color={authorTheme.primary}
                                            textColor={authorTheme.text}
                                        />

                                        <Link
                                            href={`/libros/${featuredBook.slug}`}
                                            className="
            mt-4
            px-5 py-2
            rounded-xl
            font-semibold
            border
            inline-flex
            items-center
            justify-center
            transition
            hover:opacity-80
        "
                                            style={{
                                                color: authorTheme.text,
                                                backgroundColor: authorTheme.surface,
                                                borderColor: authorTheme.border
                                            }}
                                        >
                                            Ver detalles
                                        </Link>

                                    </div>
                                </div>
                            </>
                        </div>
                    </section>
                )}

                <section
                    className="rounded-3xl p-6 md:p-8"
                    style={{
                        backgroundColor: authorTheme.surface,
                        border: `1px solid ${authorTheme.border}`
                    }}
                >
                    <div className="mb-10">
                        <p
                            className="text-xs uppercase tracking-[0.35em]"
                            style={{
                                color: authorTheme.muted
                            }}
                        >
                            Bibliografía
                        </p>

                        <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>

                                <h2
                                    className="text-2xl font-bold"
                                    style={{
                                        color: authorTheme.text
                                    }}
                                >
                                    Libros publicados
                                </h2>

                                <p
                                    className="mt-3"
                                    style={{
                                        color: authorTheme.muted
                                    }}
                                >
                                    Todas las obras de {author.name}
                                </p>

                            </div>

                        </div>

                    </div>

                    {books.length === 0 && (
                        <div className="py-12 text-center text-zinc-500">
                            Este autor todavía no tiene libros publicados.
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">

                        {books.map(book => (

                            <article
                                key={book.id}
                                className="
            group
            overflow-hidden
            rounded-3xl
            transition-all
            duration-500
            hover:-translate-y-2
        "
                                style={{
                                    backgroundColor: authorTheme.bg,
                                    border: `1px solid ${authorTheme.border}`
                                }}
                            >

                                {/* PORTADA */}
                                <div className="p-2">

                                    <div
                                        className="
                    relative
                    overflow-hidden
                    aspect-[2/3]
                    bg-zinc-950
                    rounded-2xl
                "
                                    >

                                        <CoverImage
                                            src={getBookCover(
                                                {
                                                    es: book.asin_es,
                                                    mx: book.asin_mx,
                                                    us: book.asin_us
                                                },
                                                book.cover
                                            )}
                                            alt={book.title}
                                            className="
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                    "
                                        />

                                        <div
                                            className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/50
                        via-transparent
                        opacity-0
                        group-hover:opacity-100
                        transition
                    "
                                        />

                                    </div>

                                </div>


                                {/* INFORMACIÓN */}

                                <div className="px-4 pb-4">

                                    <h3
                                        className="
                    font-bold
                    text-sm
                    md:text-base
                    line-clamp-2
                    transition-colors
                "
                                        style={{
                                            color: authorTheme.text
                                        }}
                                    >
                                        {book.title}
                                    </h3>


                                    <div className="mt-3 flex flex-wrap gap-1.5">

                                        {(book.genres ?? [])
                                            .slice(0, 2)
                                            .map((id: string) => {

                                                const genre =
                                                    genresCatalog.find(
                                                        g => g.id === id
                                                    )

                                                if (!genre)
                                                    return null

                                                return (

                                                    <GenreBadge
                                                        key={genre.id}
                                                        label={genre.label}
                                                        type={genre.id}
                                                        theme={authorTheme}
                                                    />

                                                )

                                            })
                                        }

                                    </div>


                                    <div className="mt-5 space-y-3">

                                        <AmazonButton
                                            amazon={{
                                                es: book.asin_es,
                                                mx: book.asin_mx,
                                                us: book.asin_us
                                            }}
                                            amazonLink={book.amazonLink}
                                            color={authorTheme.primary}
                                            textColor={authorTheme.text}
                                        />


                                        <Link
                                            href={`/libros/${book.slug}`}
                                            className="
                                                block
                                                text-center
                                                text-xs
                                                font-semibold
                                                py-2
                                                rounded-xl
                                                border
                                                transition
                                                hover:opacity-80
                                            "
                                            style={{
                                                color: authorTheme.primary,
                                                borderColor: authorTheme.border
                                            }}
                                        >
                                            Ver detalles
                                        </Link>

                                    </div>


                                </div>


                            </article>

                        ))}


                    </div>

                </section>

            </main>

        </div >
    )
}