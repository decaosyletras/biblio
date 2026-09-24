"use client"

import AuthorBookCoverEditor from "@/components/authors/edit/AuthorBookCoverEditor"
import type { BookCoverSource } from "@/types"

interface Props {

    authorId: string

    author: any

    updateField: (
        field: string,
        value: any
    ) => void

    books: any[]

    moveBook: (
        index: number,
        direction: number
    ) => void

    onCoverUpdated: (
        bookId: string,
        updates: {
            cover: string
            cover_source: BookCoverSource
            cover_storage_path: string
            cover_updated_at: string
        }
    ) => void

}


export default function AuthorBooksSection({
    authorId,
    author,
    updateField,
    books,
    moveBook,
    onCoverUpdated
}: Props) {

    const pendingCoverCount = books.filter(book =>
        book.cover_source !== "author_upload" &&
        book.cover_source !== "admin_upload"
    ).length


    return (

        <section className="space-y-6">

            {/* CABECERA */}

            <div>
                <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-zinc-800 border border-zinc-700">
                        📚
                    </div>

                    <div>

                        <h2 className="text-xl md:text-2xl font-bold">
                            Biblioteca del autor
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Organiza cómo aparecerán tus libros en tu página pública.
                        </p>

                    </div>

                </div>

            </div>

            {/* PORTADAS */}

            <div className="rounded-3xl border border-blue-500/25 bg-blue-500/5 p-5 space-y-5">
                <div>
                    <h3 className="font-semibold text-lg text-blue-100">
                        Portadas de tus libros
                    </h3>
                    {pendingCoverCount > 0 ? (
                        <div className="mt-2 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4">
                            <p className="text-sm font-medium text-yellow-200">
                                {pendingCoverCount === 1
                                    ? "Hay una portada pendiente de actualizar."
                                    : `Hay ${pendingCoverCount} portadas pendientes de actualizar.`}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                                Próximamente dejaremos de utilizar portadas obtenidas
                                desde servicios externos. Sube una portada autorizada
                                para evitar que posteriormente sea sustituida por una
                                imagen genérica.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-green-300">
                            Todas tus portadas están cargadas y autorizadas.
                        </p>
                    )}
                    <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                        La imagen se optimiza automáticamente. Este cambio se guarda
                        al momento y no depende del botón general Guardar cambios.
                    </p>
                </div>

                <div className="space-y-3">
                    {books.map(book => (
                        <AuthorBookCoverEditor
                            key={book.id}
                            authorId={authorId}
                            book={book}
                            onUpdated={onCoverUpdated}
                        />
                    ))}

                    {books.length === 0 && (
                        <p className="py-6 text-center text-sm text-zinc-500">
                            No hay libros disponibles para actualizar.
                        </p>
                    )}
                </div>
            </div>

            {/* LIBRO DESTACADO */}

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
                <div>
                    <h3 className="font-semibold text-lg">
                        Libro destacado
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Aparecerá como protagonista en la parte superior de tu página.
                    </p>
                </div>

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

                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3">
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

            {/* BIBLIOGRAFÍA */}

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">

                <div>
                    <h3 className="font-semibold text-lg">
                        Bibliografía
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Decide si quieres mostrar todos tus libros publicados.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        updateField(
                            "show_bibliography",
                            !author.show_bibliography
                        )
                    }

                    disabled={
                        author.show_bibliography !== false &&
                        books.length === 1 &&
                        !author.featured_book_id
                    }

                    className="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition">

                    {
                        author.show_bibliography ?
                            "Ocultar bibliografía"
                            :
                            "Mostrar bibliografía"
                    }
                </button>
            </div>

            {/* ORDEN DE LIBROS */}


            {
                author.show_bibliography !== false && (

                    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-5">

                        <div>
                            <h3 className="font-semibold text-lg">
                                Orden de libros
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">
                                Cambia el orden en el que aparecerán en tu bibliografía.
                            </p>
                        </div>

                        <div className="space-y-3">

                            {
                                books.map((book, index) => (

                                    <div
                                        key={book.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium break-words">
                                                {book.title}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveBook(index, -1)
                                                }
                                                className="flex-1 sm:flex-none w-full sm:w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveBook(index, 1)
                                                }
                                                className="flex-1 sm:flex-none w-full sm:w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))

                            }

                            {
                                books.length === 0 && (
                                    <div className="py-8 text-center text-zinc-500 text-sm">
                                        No hay libros disponibles para ordenar.

                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }

        </section>
    )
}
