"use client"

import imageCompression from "browser-image-compression"
import { useState } from "react"

interface Props {
    author: any
    setAuthor: any
    newsImageFile: File | null
    setNewsImageFile: (file: File | null) => void
}

export default function AuthorNewsSection({
    author,
    setAuthor,
    newsImageFile,
    setNewsImageFile
}: Props) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minimumExpirationDate = [
        tomorrow.getFullYear(),
        String(tomorrow.getMonth() + 1).padStart(2, "0"),
        String(tomorrow.getDate()).padStart(2, "0")
    ].join("-")

    function updateNewsField(
        field: string,
        value: any
    ) {

        setAuthor((prev: any) => ({
            ...prev,
            news: {
                ...(prev.news ?? {}),
                [field]: value
            }
        }))

    }

    function updateExpirationDate(value: string | null) {
        setAuthor((prev: Record<string, unknown>) => ({
            ...prev,
            news_expires_on: value
        }))
    }


    return (

        <section>

            {/* CABECERA */}

            <div>

                <div className="flex items-center gap-3">

                    <div
                        className="
                            w-12
                            h-12
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            text-xl
                            bg-yellow-500/10
                            border
                            border-yellow-500/20
                        "
                    >
                        📰
                    </div>


                    <div>

                        <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                            Novedades para lectores
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Comparte noticias, avances o anuncios con tus lectores.
                        </p>

                    </div>

                </div>

            </div>


            {/* FORMULARIO */}

            <div
                className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-5">

                <h3 className="font-semibold text-lg">
                    Información de la novedad
                </h3>

                <div>

                    <label className="text-sm text-zinc-400 block mb-2">
                        Tipo
                    </label>

                    <select
                        value={author.news?.type ?? ""}
                        onChange={e =>
                            updateNewsField(
                                "type",
                                e.target.value
                            )
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3">

                        <option value="">
                            Sin novedad
                        </option>

                        <option>
                            Lanzamiento
                        </option>

                        <option>
                            Próxima publicación
                        </option>

                        <option>
                            Nuevo capítulo
                        </option>

                        <option>
                            Avance de escritura
                        </option>

                        <option>
                            Fragmento exclusivo
                        </option>

                        <option>
                            Proyecto nuevo
                        </option>

                        <option>
                            Oferta
                        </option>

                        <option>
                            Evento
                        </option>

                        <option>
                            Entrevista / aparición
                        </option>

                        <option>
                            Premio o reconocimiento
                        </option>

                        <option>
                            Actualización de plataforma
                        </option>

                        <option>
                            Noticia para lectores
                        </option>

                        <option>
                            Otro
                        </option>

                    </select>

                </div>

                <div>

                    <label className="text-sm text-zinc-400 block mb-2">
                        Título
                    </label>

                    <input
                        maxLength={80}
                        value={
                            author.news?.title ?? ""
                        }

                        onChange={e =>
                            updateNewsField(
                                "title",
                                e.target.value
                            )
                        }

                        placeholder="Ej: Mi nueva novela ya está disponible"

                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />

                </div>

                <div>

                    <label className="text-sm text-zinc-400 block mb-2">
                        Texto
                    </label>

                    <textarea
                        maxLength={800}
                        value={
                            author.news?.content ?? ""
                        }

                        onChange={e =>
                            updateNewsField(
                                "content",
                                e.target.value
                            )
                        }

                        rows={6}

                        placeholder="Escribe los detalles de la novedad..."

                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 resize-none" />

                </div>

                <div className="space-y-3">

                    <div>
                        <label
                            htmlFor="news-expires-on"
                            className="text-sm text-zinc-400 block mb-2"
                        >
                            Fecha de caducidad
                        </label>

                        <input
                            id="news-expires-on"
                            type="date"
                            min={minimumExpirationDate}
                            disabled={!author.news_expires_on}
                            value={author.news_expires_on ?? ""}
                            onChange={e =>
                                updateExpirationDate(e.target.value || null)
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <p className="text-xs text-zinc-500 mt-2">
                            La novedad seguirá visible durante el día elegido.
                        </p>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-zinc-300">
                        <input
                            type="checkbox"
                            checked={!author.news_expires_on}
                            onChange={e =>
                                updateExpirationDate(
                                    e.target.checked
                                        ? null
                                        : minimumExpirationDate
                                )
                            }
                            className="h-4 w-4 accent-yellow-500"
                        />
                        Sin fecha límite
                    </label>

                </div>

            </div>
            {/* IMAGEN */}

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">

                <div>

                    <h3 className="font-semibold text-lg">
                        Imagen de la novedad
                    </h3>

                    <p className="text-sm text-zinc-500 mt-1">
                        Recomendado: imagen horizontal 1200×630 px.
                    </p>

                    <p className="text-sm text-zinc-500">
                        Opcional. Puedes publicar la novedad sin una imagen.
                    </p>

                </div>

                <label
                    className="group relative block overflow-hidden rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-950 cursor-pointer transition hover:border-yellow-500/50">

                    {author.news?.image ? (

                        <>

                            <img
                                src={author.news.image}
                                className="w-full aspect-[1200/630] object-cover transition duration-500 group-hover:scale-[1.02]"
                            />

                            <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                                <div
                                    className="px-5 py-3 rounded-2xl bg-yellow-500/10 backdrop-blur border border-yellow-500/30 text-yellow-300 font-medium">
                                    Cambiar imagen
                                </div>

                            </div>

                        </>

                    ) : (

                        <div className="aspect-[1200/630] flex flex-col items-center justify-center text-center px-8">

                            <p className="font-semibold text-white">
                                Haz clic para subir una imagen
                            </p>

                            <p className="text-sm text-zinc-500 mt-2">
                                PNG, JPG o WEBP
                            </p>

                        </div>

                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {

                            const file = e.target.files?.[0]

                            if (!file) return

                            setNewsImageFile(file)

                            setAuthor((prev: any) => ({
                                ...prev,
                                news: {
                                    ...(prev.news ?? {}),
                                    image: URL.createObjectURL(file)
                                }
                            }))

                        }}
                    />

                </label>



                {author.news?.image && (

                    <button

                        type="button"

                        onClick={() => {

                            setNewsImageFile(null)

                            setAuthor((prev: any) => ({

                                ...prev,

                                news: {
                                    ...(prev.news ?? {}),
                                    image: null
                                }

                            }))

                        }}

                        className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">

                        Eliminar imagen

                    </button>

                )}

            </div>


            {/* PREVIEW */}


            {/*<div
                className="
                    rounded-3xl
                    bg-zinc-950
                    border
                    border-zinc-800
                    overflow-hidden
                "
            >

                <div
                    className="
                        px-5
                        py-4
                        border-b
                        border-zinc-800
                    "
                >

                    <h3 className="font-semibold">
                        Vista previa
                    </h3>

                    <p className="text-sm text-zinc-500 mt-1">
                        Así verán la novedad tus lectores.
                    </p>

                </div>

                {author.news?.image && (

                    <img
                        src={author.news.image}
                        className="
                            w-full
                            aspect-[1200/630]
                            object-cover
                        "
                    />

                )}

                <div className="p-6">

                    <p
                        className="
                            text-xs
                            uppercase
                            tracking-[0.35em]
                            text-zinc-500
                        "
                    >

                        {author.news?.type ||
                            "Tipo de novedad"}

                    </p>

                    <h3
                        className="
                            mt-3
                            text-2xl
                            font-bold
                            text-white
                        "
                    >

                        {author.news?.title ||
                            "Título de la novedad"}

                    </h3>

                    <p
                        className="
                            mt-4
                            whitespace-pre-line
                            leading-7
                            text-zinc-400
                        "
                    >

                        {author.news?.content ||
                            "Aquí aparecerá el texto de la novedad..."}

                    </p>

                </div>

            </div>*/}

        </section>

    )

}
