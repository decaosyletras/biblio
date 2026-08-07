import { CheckCircle2, Circle } from "lucide-react"

type AuthorReadinessData = {
    avatar?: string | null
    bio?: string | null
    style?: string | null
    featured_book_id?: string | null
    show_bibliography?: boolean | null
}

type AuthorBook = {
    id?: string | null
}

export default function AuthorPageReadiness({
    author,
    books
}: {
    author: AuthorReadinessData
    books: AuthorBook[]
}) {
    const hasAvatar = Boolean(
        author.avatar?.trim() && author.avatar !== "/avatars/default.jpg"
    )
    const hasBio = Boolean(author.bio?.trim())
    const hasStyle = Boolean(author.style?.trim())
    const hasValidFeaturedBook = Boolean(
        author.featured_book_id &&
        books.some(book => book.id === author.featured_book_id)
    )
    const hasVisibleBook = books.length > 0 && (
        author.show_bibliography !== false || hasValidFeaturedBook
    )
    const essentials = [
        {
            label: "Biografía",
            complete: hasBio,
            weight: 35
        },
        {
            label: "Foto de perfil",
            complete: hasAvatar,
            weight: 25
        },
        {
            label: "Al menos un libro visible",
            complete: hasVisibleBook,
            weight: 25
        },
        {
            label: "Estilo literario",
            complete: hasStyle,
            weight: 15
        }
    ]
    const percentage = essentials.reduce(
        (total, item) => total + (item.complete ? item.weight : 0),
        0
    )
    const isReady = percentage === 100
    const nextStep = essentials.find(item => !item.complete)?.label

    return (
        <section className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-950/45 via-zinc-900 to-zinc-900 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-blue-300">
                        Preparación de tu página
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                        {isReady
                            ? "Tu página está lista para compartir"
                            : `Tu página está lista al ${percentage}%`}
                    </h2>
                </div>

                <span className={`shrink-0 text-2xl font-bold sm:text-3xl ${
                    isReady ? "text-emerald-300" : "text-blue-300"
                }`}>
                    {percentage}%
                </span>
            </div>

            <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800"
                role="progressbar"
                aria-label="Preparación de la página de autor"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
            >
                <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                        isReady ? "bg-emerald-400" : "bg-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {essentials.map(item => (
                    <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                            item.complete
                                ? "border-emerald-500/20 bg-emerald-500/[0.07] text-zinc-200"
                                : "border-zinc-700 bg-zinc-950/45 text-zinc-400"
                        }`}
                    >
                        {item.complete ? (
                            <CheckCircle2
                                className="h-4 w-4 shrink-0 text-emerald-400"
                                aria-hidden="true"
                            />
                        ) : (
                            <Circle
                                className="h-4 w-4 shrink-0 text-zinc-600"
                                aria-hidden="true"
                            />
                        )}
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {isReady
                    ? "Ya contiene la información esencial para que los lectores te conozcan y descubran tu obra."
                    : `Siguiente paso sugerido: completa ${nextStep?.toLocaleLowerCase("es")}.`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Las redes, la entrevista y las opciones PRO pueden enriquecer tu página, pero no afectan este porcentaje.
            </p>
        </section>
    )
}
