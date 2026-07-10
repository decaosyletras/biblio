"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

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

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)

    const [deletedBanner, setDeletedBanner] = useState<string | null>(null)
    const [originalBanner, setOriginalBanner] = useState("")

    const [originalAvatar, setOriginalAvatar] = useState("")

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
            banner: authorData.banner ?? ""
        })
        setOriginalBanner(authorData.banner)
        setOriginalAvatar(authorData.avatar)
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

    async function save() {
        if (!author) return
        setSaving(true)
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
            data.current_news = author.current_news ?? ""
            data.featured_book_id = author.featured_book_id ?? null
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
        const fileName =
            `${crypto.randomUUID()}-${file.name}`

        const path =
            `${folder}/${fileName}`

        const { error } =
            await supabase.storage
                .from("authors")
                .upload(
                    path,
                    file
                )

        if (error) {
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

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-5">

                    <h2 className="text-xl font-semibold">
                        Información básica
                    </h2>

                    <div>

                        <label className="text-sm text-zinc-300 block mb-3 font-medium">
                            Foto de perfil
                        </label>

                        <label
                            className="group relative flex items-center gap-5 p-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 hover:border-blue-500 hover:bg-zinc-900/70 transition cursor-pointer"
                        >
                            <div className="relative shrink-0">
                                <img
                                    src={author.avatar || "/avatars/default.jpg"}
                                    className="w-28 h-28 rounded-2xl object-cover border border-zinc-700 shadow-xl"
                                />

                                <div
                                    className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                >
                                    <span
                                        className="text-xs font-medium text-white bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/20"
                                    >
                                        Cambiar
                                    </span>
                                </div>

                            </div>

                            <div className="flex-1">

                                <p className="text-white font-medium">
                                    Sube tu foto de perfil
                                </p>

                                <p className="text-sm text-zinc-500 mt-1">
                                    Recomendado: imagen cuadrada 500×500 px
                                </p>

                                <p className="text-xs text-zinc-600 mt-2">
                                    PNG, JPG o WEBP
                                </p>

                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {

                                    const file = e.target.files?.[0]

                                    if (!file) return

                                    setAvatarFile(file)

                                    updateField(
                                        "avatar",
                                        URL.createObjectURL(file)
                                    )

                                }}
                            />

                        </label>

                    </div>

                    <div>
                        <label className="text-sm text-zinc-400 block mb-2">
                            Biografía
                        </label>
                        <textarea
                            value={author.bio ?? ""}
                            onChange={e => updateField("bio", e.target.value)}
                            rows={6}
                            placeholder="Cuéntale a los lectores quién eres"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400 block mb-2">
                            Estilo
                        </label>
                        <input
                            value={author.style ?? ""}
                            onChange={e => updateField("style", e.target.value)}
                            placeholder="Ej: fantasía oscura, thriller..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                        />
                    </div>

                </div>

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

                        <div>
                            <label className="text-sm text-zinc-300 block mb-2 font-medium">
                                Banner
                            </label>

                            <p className="text-xs text-zinc-500 mb-4">
                                Recomendado: imagen horizontal 1600×500 px (relación 3:1).
                            </p>

                            <label
                                className="group relative block w-full overflow-hidden rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 hover:border-violet-500 hover:bg-zinc-900/70 transition cursor-pointer"
                            >
                                {author.banner ? (
                                    <>
                                        <img
                                            src={author.banner}
                                            className="w-full h-44 object-cover"
                                        />

                                        <div
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                        >
                                            <div
                                                className="px-5 py-2 rounded-xl bg-white/10 backdrop-blur text-white font-medium border border-white/20"
                                            >
                                                Cambiar banner
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="h-44 flex flex-col items-center justify-center gap-3 text-center px-6"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                Haz clic para subir un banner
                                            </p>

                                            <p className="text-sm text-zinc-500 mt-1">
                                                PNG, JPG o WEBP
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0]
                                        if (!file) return

                                        setBannerFile(file)

                                        updateField(
                                            "banner",
                                            URL.createObjectURL(file)
                                        )
                                    }}
                                />
                            </label>

                            {author.banner && (
                                <button
                                    type="button"
                                    onClick={() => updateField("banner", null)}
                                    className="mt-4 w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                >
                                    Eliminar banner
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">

                            <label className="text-sm text-zinc-400 block">
                                Redes sociales
                            </label>

                            <input
                                value={author.website ?? ""}
                                onChange={e => updateField("website", e.target.value)}
                                placeholder="Sitio web"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                            <input
                                value={author.instagram ?? ""}
                                onChange={e => updateField("instagram", e.target.value)}
                                placeholder="Instagram"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                            <input
                                value={author.threads ?? ""}
                                onChange={e => updateField("threads", e.target.value)}
                                placeholder="Threads"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                            <input
                                value={author.facebook ?? ""}
                                onChange={e => updateField("facebook", e.target.value)}
                                placeholder="Facebook"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                            <input
                                value={author.tiktok ?? ""}
                                onChange={e => updateField("tiktok", e.target.value)}
                                placeholder="TikTok"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                            <input
                                value={author.youtube ?? ""}
                                onChange={e => updateField("youtube", e.target.value)}
                                placeholder="YouTube"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            />

                        </div>

                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">
                                Noticia actual
                            </label>

                            <textarea
                                value={author.current_news ?? ""}
                                onChange={e => updateField("current_news", e.target.value)}
                                rows={4}
                                placeholder="Ej: Nuevo libro disponible..."
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 resize-none"
                            />

                        </div>

                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">
                                Estilo rápido
                            </label>

                            <div className="grid grid-cols-2 gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setAuthor((prev: any) => ({
                                            ...prev,
                                            theme: {
                                                ...prev.theme,
                                                bg: "#09090b",
                                                surface: "#18181b",
                                                primary: "#2563eb",
                                                text: "#ffffff",
                                                muted: "#a1a1aa",
                                                border: "#27272a"
                                            }
                                        }))
                                    }
                                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-blue-500"
                                >
                                    Oscuro
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setAuthor((prev: any) => ({
                                            ...prev,
                                            theme: {
                                                ...prev.theme,
                                                bg: "#faf7f0",
                                                surface: "#ffffff",
                                                primary: "#92400e",
                                                text: "#292524",
                                                muted: "#78716c",
                                                border: "#d6d3d1"
                                            }
                                        }))
                                    }
                                    className="p-4 rounded-xl bg-white text-black border border-zinc-300 hover:border-amber-500"
                                >
                                    Crema
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setAuthor((prev: any) => ({
                                            ...prev,
                                            theme: {
                                                ...prev.theme,
                                                bg: "#071a12",
                                                surface: "#143b2b",
                                                primary: "#61dfb5",
                                                text: "#ecfdf5",
                                                muted: "#a7f3d0",
                                                border: "#065f46"
                                            }
                                        }))
                                    }
                                    className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 hover:border-emerald-400"
                                >
                                    Fantasía
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setAuthor((prev: any) => ({
                                            ...prev,
                                            theme: {
                                                ...prev.theme,
                                                bg: "#2a1020",
                                                surface: "#4b1c37",
                                                primary: "#da639e",
                                                text: "#fff1f2",
                                                muted: "#fda4af",
                                                border: "#a81e45"
                                            }
                                        }))
                                    }
                                    className="p-4 rounded-xl bg-rose-950 border border-rose-700 hover:border-rose-400"
                                >
                                    Romántico
                                </button>

                            </div>
                        </div>

                        <div className="space-y-6">

                            <div>
                                <h3 className="font-semibold text-lg">
                                    Personalización visual
                                </h3>

                                <p className="text-sm text-zinc-500 mt-1">
                                    Ajusta la identidad visual de tu página de autor.
                                </p>
                            </div>


                            <div className="grid sm:grid-cols-2 gap-4">

                                {[
                                    {
                                        key: "bg",
                                        label: "Fondo de página",
                                        value: author.theme?.bg ?? "#09090b"
                                    },
                                    {
                                        key: "surface",
                                        label: "Tarjetas",
                                        value: author.theme?.surface ?? "#18181b"
                                    },
                                    {
                                        key: "primary",
                                        label: "Color principal",
                                        value: author.theme?.primary ?? "#2563eb"
                                    },
                                    {
                                        key: "text",
                                        label: "Texto principal",
                                        value: author.theme?.text ?? "#ffffff"
                                    },
                                    {
                                        key: "muted",
                                        label: "Texto secundario",
                                        value: author.theme?.muted ?? "#a1a1aa"
                                    },
                                    {
                                        key: "border",
                                        label: "Bordes",
                                        value: author.theme?.border ?? "#27272a"
                                    }

                                ].map(color => (

                                    <div
                                        key={color.key}
                                        className="
                    flex items-center justify-between
                    gap-4
                    p-4
                    rounded-2xl
                    bg-zinc-950
                    border border-zinc-800
                "
                                    >

                                        <div>
                                            <p className="font-medium">
                                                {color.label}
                                            </p>

                                            <p className="text-xs text-zinc-500 uppercase mt-1">
                                                {color.value}
                                            </p>
                                        </div>


                                        <input
                                            type="color"
                                            value={color.value}
                                            onChange={e =>
                                                setAuthor((prev: any) => ({
                                                    ...prev,
                                                    theme: {
                                                        ...(prev.theme ?? {}),
                                                        [color.key]: e.target.value
                                                    }
                                                }))
                                            }
                                            className="
                        w-12
                        h-12
                        rounded-xl
                        overflow-hidden
                        cursor-pointer
                        border
                        border-zinc-700
                    "
                                        />

                                    </div>

                                ))}

                            </div>


                            <div
                                className="
            p-4
            rounded-2xl
            bg-zinc-950
            border border-zinc-800
        "
                            >

                                <label className="font-medium block mb-3">
                                    Estilo de letra
                                </label>


                                <select
                                    value={author.theme?.font ?? "sans"}
                                    onChange={e =>
                                        setAuthor((prev: any) => ({
                                            ...prev,
                                            theme: {
                                                ...(prev.theme ?? {}),
                                                font: e.target.value
                                            }
                                        }))
                                    }
                                    className="
                w-full
                bg-zinc-900
                border border-zinc-700
                rounded-xl
                p-3
            "
                                >

                                    <option value="sans">
                                        Moderna
                                    </option>

                                    <option value="serif">
                                        Clásica
                                    </option>

                                    <option value="mono">
                                        Editorial
                                    </option>

                                </select>

                            </div>


                        </div>

                        <div>

                            <h3 className="font-semibold mb-3">
                                Libro destacado
                            </h3>

                            <select
                                value={
                                    author.featured_book_id ?? ""
                                }

                                onChange={e =>
                                    updateField(
                                        "featured_book_id",
                                        e.target.value || null
                                    )
                                }

                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                            >

                                <option value="">
                                    Sin libro destacado
                                </option>

                                {books.map(book => (

                                    <option
                                        key={book.id}
                                        value={book.id}
                                    >
                                        {book.title}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div>

                            <h3 className="font-semibold mb-3">
                                Orden de libros
                            </h3>

                            <div className="space-y-3">

                                {books.map((book, index) => (

                                    <div
                                        key={book.id}
                                        className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3"
                                    >

                                        <p className="text-sm flex-1 line-clamp-2">
                                            {index + 1}. {book.title}
                                        </p>

                                        <div className="flex gap-2">

                                            <button
                                                onClick={() => moveBook(index, -1)}
                                                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                onClick={() => moveBook(index, 1)}
                                                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                                            >
                                                ↓
                                            </button>

                                        </div>

                                    </div>

                                ))}

                                {books.length === 0 && (
                                    <p className="text-zinc-500 text-sm">
                                        No hay libros para ordenar.
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>
                )}

                <button
                    onClick={() => {
                        save()
                    }}
                    disabled={saving}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition disabled:opacity-50"
                >
                    {saving ? "Guardando..." : "Guardar cambios"}
                </button>

            </div>

        </div >

    )
}