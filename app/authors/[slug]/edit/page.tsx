"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SiWattpad } from "react-icons/si"
import imageCompression from "browser-image-compression"
import AuthorBasicSection from "@/components/authors/edit/AuthorBasicSection"
import AuthorSocialSection from "@/components/authors/edit/AuthorSocialSection"
import AuthorBannerSection from "@/components/authors/edit/AuthorBannerSection"
import AuthorNewsSection from "@/components/authors/edit/AuthorNewsSection"
import AuthorThemeSection from "@/components/authors/edit/AuthorThemeSection"
import AuthorBooksSection from "@/components/authors/edit/AuthorBooksSection"

export default function EditAuthorPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [allowed, setAllowed] = useState(false)
    const [isPro, setIsPro] = useState(false)
    const [author, setAuthor] = useState<any>(null)
    const [books, setBooks] = useState<any[]>([])
    const [socialOrder, setSocialOrder] = useState<string[]>([])

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [newsImageFile, setNewsImageFile] = useState<File | null>(null)

    const [deletedBanner, setDeletedBanner] = useState<string | null>(null)
    const [originalBanner, setOriginalBanner] = useState("")
    const [originalAvatar, setOriginalAvatar] = useState("")
    const [originalNewsImage, setOriginalNewsImage] = useState("")

    useEffect(() => {
        load()
    }, [])

    async function load() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }
        const { data: authorData, error } = await supabase
            .from("authors")
            .select("*")
            .eq("slug", slug)
            .single()
        if (error || !authorData) {
            router.push("/")
            return
        }

        const { data: claim } = await supabase
            .from("author_claims")
            .select("id")
            .eq("author_id", authorData.id)
            .eq("user_id", user.id)
            .eq("status", "approved")
            .maybeSingle()
        if (!claim) {
            setLoading(false)
            return
        }
        setAllowed(true)
        setIsPro(authorData.pro === true)
        setAuthor({
            ...authorData,
            avatar: authorData.avatar ?? "",
            banner: authorData.banner ?? "",
            news: {
                ...(authorData.news ?? {}),
                image: authorData.news?.image ?? null
            }
        })

        const defaultOrder = [
            "website",
            "instagram",
            "wattpad",
            "threads",
            "facebook",
            "tiktok",
            "youtube"
        ]

        setSocialOrder(
            authorData.social_order?.length
                ? authorData.social_order
                : defaultOrder
        )

        setOriginalBanner(authorData.banner)
        setOriginalAvatar(authorData.avatar)
        setOriginalNewsImage(
            authorData.news?.image ?? ""
        )
        if (authorData.pro === true) {
            const { data: directBooks } = await supabase
                .from("books")
                .select("*")
                .eq("author_id", authorData.id)
                .eq("approved", true)
            const { data: relationBooks } = await supabase
                .from("book_authors")
                .select(`books(*)`)
                .eq("author_id", authorData.id)
            const multiBooks = relationBooks?.map(item => item.books).filter(Boolean) ?? []
            const map = new Map()
                ;[...(directBooks ?? []), ...multiBooks].forEach(book => {
                    map.set(book.id, book)
                })
            setBooks(
                Array.from(map.values()).sort(
                    (a, b) => (a.author_order ?? 0) - (b.author_order ?? 0)
                )
            )
        }
        setLoading(false)
    }

    function updateField(field: string, value: any) {
        setAuthor((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    function updateTheme(value: string) {
        setAuthor((prev: any) => ({
            ...prev,
            theme: {
                ...(prev.theme ?? {}),
                background: value
            }
        }))
    }

    function moveBook(index: number, direction: number) {
        const copy = [...books]
        const target = index + direction
        if (target < 0 || target >= copy.length) return
        const temp = copy[index]
        copy[index] = copy[target]
        copy[target] = temp
        setBooks(copy)
    }

    function moveSocial(index: number, direction: number) {

        const copy = [...socialOrder]

        const target = index + direction

        if (target < 0 || target >= copy.length) return

        const temp = copy[index]

        copy[index] = copy[target]

        copy[target] = temp

        setSocialOrder(copy)
    }

    async function save() {
        if (!author) return

        if (
            author.show_bibliography === false &&
            !author.featured_book_id
        ) {
            alert(
                "Debes tener un libro destacado o activar la bibliografía."
            )
            return
        }


        setSaving(true)

        let newsImageUrl = author.news?.image ?? null

        const data: any = {
            avatar: author.avatar ?? "",
            bio: author.bio ?? "",
            description: author.description ?? "",
            style: author.style ?? ""
        }
        if (isPro) {
            let avatarUrl = author.avatar

            if (avatarFile) {
                avatarUrl = await uploadImage(
                    avatarFile,
                    "avatars"
                )
            }

            data.avatar = avatarUrl ?? ""
            let bannerUrl = author.banner

            if (bannerFile) {
                bannerUrl = await uploadImage(
                    bannerFile,
                    "banners"
                )
            }

            data.banner = bannerUrl === "" ? null : bannerUrl
            data.website = author.website ?? ""
            data.instagram = author.instagram ?? ""
            data.threads = author.threads ?? ""
            data.facebook = author.facebook ?? ""
            data.tiktok = author.tiktok ?? ""
            data.youtube = author.youtube ?? ""
            data.wattpad = author.wattpad ?? ""
            data.current_news = author.current_news ?? ""
            data.featured_book_id = author.featured_book_id ?? null
            data.social_order = socialOrder
            data.show_bibliography = author.show_bibliography ?? true
            if (newsImageFile) {
                newsImageUrl = await uploadImage(
                    newsImageFile,
                    "news"
                )
            }
            data.news = author.news
                ? {
                    ...author.news,
                    image: newsImageUrl
                }
                : null
            data.theme = author.theme ?? {
                mode: "dark",
                preset: "dark-blue",
                background: "zinc",
                primary: "blue",
                bg: "#09090b",
                surface: "#18181b",
                text: "#ffffff"
            }
        }

        // 👇 AQUÍ
        const { data: updated, error } = await supabase
            .from("authors")
            .update(data)
            .eq("id", author.id)
            .select()

        if (
            originalNewsImage &&
            originalNewsImage !== newsImageUrl
        ) {
            await deleteImage(originalNewsImage)
        }

        if (
            originalAvatar &&
            avatarFile &&
            originalAvatar !== data.avatar
        ) {
            await deleteImage(originalAvatar)
        }

        for (let i = 0; i < books.length; i++) {
            const { error } = await supabase
                .from("books")
                .update({
                    author_order: i
                })
                .eq("id", books[i].id)
        }

        if (isPro) {
            for (let i = 0; i < books.length; i++) {
                await supabase
                    .from("books")
                    .update({
                        author_order: i
                    })
                    .eq("id", books[i].id)
            }
        }
        if (deletedBanner) {

            await deleteImage(
                deletedBanner
            )

        }
        setSaving(false)
        if (originalBanner && !author.banner) {
            await deleteImage(originalBanner)
        }
        router.push(`/authors/${slug}`)
    }

    async function uploadImage(
        file: File,
        folder: string
    ) {

        const sizes: Record<string, number> = {
            avatars: 600,
            banners: 1600,
            news: 1200
        }


        const compressedFile = await imageCompression(
            file,
            {
                maxWidthOrHeight: sizes[folder] ?? 1200,
                maxSizeMB: 0.5,
                useWebWorker: true,
                fileType: "image/webp"
            }
        )


        const fileName =
            `${crypto.randomUUID()}.webp`


        const path =
            `${folder}/${fileName}`


        const { error } =
            await supabase.storage
                .from("authors")
                .upload(
                    path,
                    compressedFile,
                    {
                        contentType: "image/webp"
                    }
                )


        if (error) {
            console.error(error)
            return ""
        }


        const { data } =
            supabase.storage
                .from("authors")
                .getPublicUrl(path)


        return data.publicUrl
    }

    async function deleteImage(url: string) {

        const path = decodeURIComponent(
            url.split("/object/public/authors/")[1]
        )

        const response = await supabase.storage
            .from("authors")
            .remove([path])
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                Cargando...
            </div>
        )
    }

    if (!allowed) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
                <h1 className="text-2xl font-bold">
                    Sin permisos
                </h1>
                <p className="text-zinc-400">
                    No puedes editar este autor.
                </p>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

                <div>
                    <h1 className="text-3xl font-bold">
                        Editar página
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        {author.name}
                    </p>
                </div>

                <AuthorBasicSection
                    author={author}
                    updateField={updateField}
                    setAvatarFile={setAvatarFile}
                />

                {isPro && (
                    <div className="bg-zinc-900 border border-yellow-500/30 rounded-3xl p-5 space-y-5">

                        <div>
                            <h2 className="text-xl font-bold text-yellow-400">
                                PRO
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                Personalización avanzada de tu página.
                            </p>
                        </div>

                        {/*<textarea
                            value={author.description ?? ""}
                            onChange={e => updateField("description", e.target.value)}
                            rows={4}
                            placeholder="Descripción corta del autor"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 resize-none"
                        />*/}

                        <AuthorBannerSection
                            author={author}
                            updateField={updateField}
                            setBannerFile={setBannerFile}
                        />

                        <AuthorSocialSection
                            author={author}
                            socialOrder={socialOrder}
                            moveSocial={moveSocial}
                            updateField={updateField}
                        />

                        <AuthorNewsSection
                            author={author}
                            setAuthor={setAuthor}
                            newsImageFile={newsImageFile}
                            setNewsImageFile={setNewsImageFile}
                        />

                        <AuthorThemeSection
                            author={author}
                            setAuthor={setAuthor}
                        />

                        <AuthorBooksSection
                            author={author}
                            updateField={updateField}
                            books={books}
                            moveBook={moveBook}
                        />

                    </div>
                )}

                <button
                    onClick={() => {
                        save()
                    }}
                    disabled={saving}
                    className="w-full py-4 rounded-xl bg-stone-100
                                text-stone-900
                                hover:bg-stone-200
                                transition
                                whitespace-nowrap"
                >
                    {saving ? "Guardando..." : "Guardar cambios"}
                </button>

            </div>

        </div >

    )
}