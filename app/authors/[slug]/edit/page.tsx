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
import AuthorContactSection from "@/components/authors/edit/AuthorContactSection"
import AuthorBookSettingsSection from "@/components/authors/edit/AuthorBookSettingsSection"
import AuthorInterviewSection from "@/components/authors/edit/AuthorInterviewSection"
import ProCheckoutButton from "@/components/ProCheckoutButton"
import { Download } from "lucide-react"
import { fetchAvatarCopy } from "@/lib/avatarImport"

type InterviewQuestion = {
    id: string
    question: string
    answer: string
    is_visible: boolean
}

type ReaderSocialProfile = {
    displayName: string
    avatarUrl: string
    instagramUrl: string
    tiktokUrl: string
    wattpadUrl: string
    threadsUrl: string
    facebookUrl: string
    youtubeUrl: string
    websiteUrl: string
}

export default function EditAuthorPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingStep, setSavingStep] = useState("")
    const [allowed, setAllowed] = useState(false)
    const [isPro, setIsPro] = useState(false)
    const [author, setAuthor] = useState<any>(null)
    const [books, setBooks] = useState<any[]>([])
    const [socialOrder, setSocialOrder] = useState<string[]>([])
    const [accountEmail, setAccountEmail] = useState("")
    const [accountUsername, setAccountUsername] = useState("")
    const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
    const [readerSocialProfile, setReaderSocialProfile] = useState<ReaderSocialProfile | null>(null)
    const [readerImportNotice, setReaderImportNotice] = useState("")
    const [importingReaderProfile, setImportingReaderProfile] = useState(false)


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

        setAccountEmail(user?.email ?? "")

        if (!user) {
            router.push("/login")
            return
        }

        // Carga únicamente el username de la cuenta autenticada para mostrar
        // al usuario qué nombre aparecerá en su página pública de autor.
        const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .maybeSingle()

        setAccountUsername(profile?.username ?? "")

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
            // 2026-08-01: Se comenta porque el sitio web ya no forma parte de las redes PRO.
            // "website",
            "instagram",
            "wattpad",
            "threads",
            "facebook",
            "tiktok",
            "youtube"
        ]

        setSocialOrder(
            authorData.social_order?.length
                ? (
                    // 2026-08-01: Se comenta porque los órdenes heredados podían incluir website como red PRO.
                    // authorData.social_order
                    authorData.social_order.filter((social: string) => social !== "website")
                )
                : defaultOrder
        )

        // La API privada ya verifica la sesión y sólo devuelve el perfil lector
        // de la misma cuenta. La importación únicamente llena este formulario.
        const readerResponse = await fetch("/api/readers/profile", {
            cache: "no-store"
        })
        const readerResult = await readerResponse
            .json()
            .catch(() => null) as {
                hasReaderProfile?: boolean
                profile?: ReaderSocialProfile
            } | null

        if (
            readerResponse.ok &&
            readerResult?.hasReaderProfile &&
            readerResult.profile
        ) {
            setReaderSocialProfile(readerResult.profile)
        }

        setOriginalBanner(authorData.banner)
        setOriginalAvatar(authorData.avatar)
        setOriginalNewsImage(
            authorData.news?.image ?? ""
        )

        const interviewResponse = await fetch(
            `/api/authors/interview?authorId=${authorData.id}`
        )
        const interviewResult = await interviewResponse
            .json()
            .catch(() => null) as { questions?: InterviewQuestion[] } | null

        if (interviewResponse.ok) {
            setInterviewQuestions(interviewResult?.questions ?? [])
        }
        /*if (authorData.pro === true) {*/
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
        //}
        setLoading(false)
    }

    function updateField(field: string, value: any) {
        setAuthor((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    async function importReaderSocialProfile() {
        if (!readerSocialProfile) return

        setImportingReaderProfile(true)
        setReaderImportNotice("")

        setAuthor((previous: Record<string, unknown>) => ({
            ...previous,
            website: readerSocialProfile.websiteUrl || previous.website,
            instagram: readerSocialProfile.instagramUrl || previous.instagram,
            tiktok: readerSocialProfile.tiktokUrl || previous.tiktok,
            wattpad: readerSocialProfile.wattpadUrl || previous.wattpad,
            threads: readerSocialProfile.threadsUrl || previous.threads,
            facebook: readerSocialProfile.facebookUrl || previous.facebook,
            youtube: readerSocialProfile.youtubeUrl || previous.youtube,
        }))

        const importedSocials = [
            ["instagram", readerSocialProfile.instagramUrl],
            ["wattpad", readerSocialProfile.wattpadUrl],
            ["threads", readerSocialProfile.threadsUrl],
            ["facebook", readerSocialProfile.facebookUrl],
            ["tiktok", readerSocialProfile.tiktokUrl],
            ["youtube", readerSocialProfile.youtubeUrl],
        ].filter(([, value]) => Boolean(value))

        setSocialOrder((current) => [
            ...current,
            ...importedSocials
                .map(([social]) => social)
                .filter((social) => !current.includes(social)),
        ])

        try {
            if (readerSocialProfile.avatarUrl) {
                const copiedAvatar = await fetchAvatarCopy("reader")
                const previewUrl = URL.createObjectURL(copiedAvatar)

                setAvatarFile(copiedAvatar)
                setAuthor((previous: Record<string, unknown>) => ({
                    ...previous,
                    // La URL temporal sólo presenta la copia en el formulario.
                    // Al guardar se sube como un objeto nuevo al bucket authors.
                    avatar: previewUrl,
                }))
            }

            setReaderImportNotice(
                readerSocialProfile.avatarUrl
                    ? "Foto y enlaces importados. Revísalos y usa Guardar cambios para confirmarlos."
                    : "Enlaces importados. El perfil lector no tiene una foto para copiar."
            )
        } catch (error) {
            setReaderImportNotice(
                error instanceof Error
                    ? `${error.message}. Los enlaces sí se cargaron en el formulario.`
                    : "No se pudo importar la foto. Los enlaces sí se cargaron en el formulario."
            )
        } finally {
            setImportingReaderProfile(false)
        }
    }

    function updateInterviewQuestion(id: string, updates: Partial<InterviewQuestion>) {
        setInterviewQuestions(previous => previous.map(question =>
            question.id === id
                ? { ...question, ...updates }
                : question
        ))
    }

    function normalizeUrl(url?: string) {
        if (!url) return ""

        const value = url.trim()

        if (!value) return ""

        if (/^https?:\/\//i.test(value)) {
            return value
        }

        return `https://${value}`
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
        setSavingStep("Preparando...")

        try {

            let newsImageUrl = author.news?.image ?? null

            let avatarUrl = author.avatar
            let bannerUrl = author.banner ?? null


if (avatarFile) {
    setSavingStep("Subiendo foto de perfil...")
    avatarUrl = await uploadImage(
        avatarFile,
        "avatars"
    )
}

const data: any = {
    avatar: avatarUrl ?? "",
    bio: author.bio ?? "",
    description: author.description ?? "",
    style: author.style ?? "",
    featured_book_id: author.featured_book_id ?? null,
    show_bibliography: author.show_bibliography ?? true,
    show_username: author.show_username === true,
    website: normalizeUrl(author.website),
    instagram: normalizeUrl(author.instagram),
    threads: normalizeUrl(author.threads),
    facebook: normalizeUrl(author.facebook),
    tiktok: normalizeUrl(author.tiktok),
    youtube: normalizeUrl(author.youtube),
    wattpad: normalizeUrl(author.wattpad),
    social_order: socialOrder.filter(
        social => social !== "website"
    )
}

if (isPro) {
    if (bannerFile) {
        bannerUrl = await uploadImage(
            bannerFile,
            "banners"
        )
    }

    data.contact_email = author.contact_email ?? ""
    data.show_book_details = author.show_book_details ?? true

    data.banner = bannerUrl || null
    data.current_news = author.current_news ?? ""

    if (newsImageFile) {
        newsImageUrl = await uploadImage(
            newsImageFile,
            "news"
        )
    }
}
            if (isPro) {
                if (bannerFile) {
                    setSavingStep("Subiendo banner...")
                    bannerUrl = await uploadImage(
                        bannerFile,
                        "banners"
                    )
                }

                data.contact_email = author.contact_email ?? ""
                data.show_book_details = author.show_book_details ?? true

                data.banner = bannerUrl || null
                data.website = normalizeUrl(author.website)
                data.current_news = author.current_news ?? ""

                if (newsImageFile) {
                    setSavingStep("Subiendo imagen de novedades...")
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
                // Una fecha nula indica que la novedad no tiene fecha límite.
                data.news_expires_on = author.news_expires_on || null
                // Se comento porque la fecha de actualizacion ya la genera el
                // servidor y no debe confiarse en un valor enviado por el cliente.
                // data.news_updated_at = new Date().toISOString()

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
            /*
             * Implementacion anterior conservada como referencia.
             * Se comento porque actualizaba directamente la tabla authors desde el
             * navegador y permitia intentar modificar columnas reservadas como PRO.
            const { data: updated, error } = await supabase
                .from("authors")
                .update(data)
                .eq("id", author.id)
                .select()
            */

            setSavingStep("Guardando información...")
            const controller = new AbortController()

            const timeout = setTimeout(() => {
                controller.abort()
            }, 30000)

            const updateResponse = await fetch("/api/authors/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    authorId: author.id,
                    updates: data
                }),
                signal: controller.signal
            })

            clearTimeout(timeout)

            const updateResult = await updateResponse
                .json()
                .catch(() => null) as {
                    error?: string
                } | null

            if (!updateResponse.ok) {
                alert(
                    updateResult?.error ??
                    "No se pudo actualizar el autor"
                )
                return
            }

            setSavingStep("Guardando entrevista...")
            const interviewResponse = await fetch("/api/authors/interview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    authorId: author.id,
                    showInterview: author.show_interview === true,
                    questions: interviewQuestions.map(question => ({
                        id: question.id,
                        answer: question.answer,
                        isVisible: question.is_visible
                    }))
                })
            })

            const interviewResult = await interviewResponse
                .json()
                .catch(() => null) as { error?: string } | null

            if (!interviewResponse.ok) {
                alert(
                    interviewResult?.error ??
                    "No se pudo guardar la entrevista"
                )
                return
            }

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

            setSavingStep("Actualizando libros...")
            for (let i = 0; i < books.length; i++) {
                const { error } = await supabase
                    .from("books")
                    .update({
                        author_order: i
                    })
                    .eq("id", books[i].id)
            }

            /*if (isPro) {
                for (let i = 0; i < books.length; i++) {
                    await supabase
                        .from("books")
                        .update({
                            author_order: i
                        })
                        .eq("id", books[i].id)
                }
            }*/
            if (originalBanner && originalBanner !== data.banner) {
                await deleteImage(originalBanner)
            }

            router.push(`/authors/${slug}`)
        } catch (err: any) {
            console.error(err)

            if (err.name === "AbortError") {
                alert("El servidor tardó demasiado en responder.")
                return
            }

            alert("Ocurrió un error al guardar.")
        } finally {
            setSaving(false)
            setSavingStep("")
        }
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
                    accountUsername={accountUsername}
                    updateField={updateField}
                    setAvatarFile={setAvatarFile}
                />

                {readerSocialProfile && (
                    <section className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-blue-200">
                                    Importar desde tu perfil lector
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                                    Copia el sitio web y las redes disponibles de {readerSocialProfile.displayName || "tu perfil lector"}. Podrás revisarlos antes de guardar.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={importReaderSocialProfile}
                                disabled={importingReaderProfile}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500"
                            >
                                <Download size={18} />
                                {importingReaderProfile ? "Importando..." : "Importar foto y enlaces"}
                            </button>
                        </div>

                        {readerImportNotice && (
                            <p
                                role="status"
                                aria-live="polite"
                                className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300"
                            >
                                {readerImportNotice}
                            </p>
                        )}
                    </section>
                )}

                <div className="border-t border-zinc-500/70 pt-5">
                    <section>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-zinc-800 border border-zinc-700">
                                🔗
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">
                                    Sitio web
                                </h2>
                                <p className="text-sm text-zinc-400 mt-1">
                                    Añade el enlace a tu sitio web.
                                </p>
                            </div>
                        </div>
                        <input
                            value={author.website ?? ""}
                            maxLength={500}
                            onChange={e => updateField("website", e.target.value)}
                            placeholder="https://tuweb.com"
                            className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
                        />
                    </section>
                </div>


                <div className="border-t border-zinc-500/70 pt-5">
                    <AuthorBooksSection
                        author={author}
                        updateField={updateField}
                        books={books}
                        moveBook={moveBook}
                    />
                </div>

                <div className="border-t border-zinc-500/70 pt-5">
                    <AuthorSocialSection
                        author={author}
                        socialOrder={socialOrder}
                        moveSocial={moveSocial}
                        updateField={updateField}
                    />
                </div>

                <div className="border-t border-zinc-500/70 pt-5">
                    <AuthorInterviewSection
                        questions={interviewQuestions}
                        showInterview={author.show_interview === true}
                        onShowInterviewChange={value =>
                            updateField("show_interview", value)
                        }
                        onQuestionChange={updateInterviewQuestion}
                    />
                </div>


                {!isPro && (
                    <div className="rounded-3xl bg-zinc-900 border border-yellow-500/30 p-5 space-y-5">

                        <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-yellow-500/10 border border-yellow-500/20">
                                👑
                            </div>

                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                                    Desbloquea PRO
                                </h2>

                                <p className="text-sm text-zinc-400 mt-1">
                                    Lleva tu página de autor al siguiente nivel.
                                </p>
                            </div>

                        </div>


                        <div className="space-y-3 text-sm text-zinc-300">

                            <p>
                                Con PRO podrás personalizar tu página y añadir:
                            </p>

                            <ul className="space-y-2 text-zinc-400">

                                <li>
                                    🖼️ Banner personalizado de autor
                                </li>

                                <li>
                                    ✉️ Correo de contacto para lectores
                                </li>

                                <li>
                                    📢 Sección de novedades
                                </li>

                                <li>
                                    🎨 Personalización de colores de la página
                                </li>

                                <li>
                                    ✍️ Elección de fuente de texto
                                </li>

                                <li>
                                    📚 Control del botón "Ver detalles" de tus libros
                                </li>

                            </ul>

                        </div>

                        <p className="text-xs text-zinc-500">
                            Estas herramientas están disponibles para autores PRO.
                        </p>

                        <p className="text-xs text-yellow-500">
                            ⚠️ ¿Te registraste para ser de los primeros en usar la segunda versión? Revisa tu correo, incluida la carpeta de <strong>Promociones</strong> o <strong>Spam</strong>.
                        </p>

                        <ProCheckoutButton
                            authorId={author.id}
                        />

                    </div>
                )}



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

                        <div className="border-t border-yellow-500/70 pt-5">
                            <AuthorBookSettingsSection
                                author={author}
                                updateField={updateField}
                            />
                        </div>


                        <div className="border-t border-yellow-500/70 pt-5">
                            <AuthorBannerSection
                                author={author}
                                updateField={updateField}
                                setBannerFile={setBannerFile}
                            />
                        </div>

                        <div className="border-t border-yellow-500/70 pt-5">
                            <AuthorContactSection
                                author={author}
                                accountEmail={accountEmail}
                                updateField={updateField}
                            />
                        </div>


                        <div className="border-t border-yellow-500/70 pt-5">
                            <AuthorNewsSection
                                author={author}
                                setAuthor={setAuthor}
                                newsImageFile={newsImageFile}
                                setNewsImageFile={setNewsImageFile}
                            />
                        </div>

                        <div className="border-t border-yellow-500/70 pt-5">
                            <AuthorThemeSection
                                author={author}
                                setAuthor={setAuthor}
                            />
                        </div>

                    </div>
                )}

                <button
                    onClick={() => {
                        save()
                    }}
                    disabled={saving}
                    className="w-full py-4 rounded-xl bg-stone-100 text-stone-900 hover:bg-stone-200 whitespace-nowrap active:scale-95
                                active:bg-stone-300 transition-all duration-150">
                    {saving ? savingStep : "Guardar cambios"}
                </button>

            </div>

        </div >

    )
}
