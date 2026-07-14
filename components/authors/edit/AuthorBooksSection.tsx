"use client"

interface Props {

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

}


export default function AuthorBooksSection({

    author,

    updateField,

    books,

    moveBook

}: Props) {


    return (

        <section>


            {/* CABECERA */}


            <div>

                <h2
                    className="
                        text-xl
                        md:text-2xl
                        font-bold
                        text-yellow-400
                    "
                >
                    📚 Biblioteca del autor
                </h2>


                <p className="text-sm text-zinc-400 mt-2">
                    Organiza cómo aparecerán tus libros en tu página pública.
                </p>


            </div>



            {/* LIBRO DESTACADO */}


            <div
                className="
                    rounded-3xl
                    bg-zinc-950
                    border
                    border-zinc-800
                    p-5
                    space-y-4
                "
            >

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


                    className="
                        w-full
                        bg-zinc-900
                        border
                        border-zinc-700
                        rounded-xl
                        p-3
                    "

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




            {/* BIBLIOGRAFÍA */}



            <div
                className="
                    rounded-3xl
                    bg-zinc-950
                    border
                    border-zinc-800
                    p-5
                    space-y-4
                "
            >


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


                    className="
                        w-full
                        py-3
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        hover:bg-zinc-800
                        transition
                    "

                >

                    {
                        author.show_bibliography

                            ?

                            "Ocultar bibliografía"

                            :

                            "Mostrar bibliografía"
                    }


                </button>



            </div>

            {/* ORDEN DE LIBROS */}


            {
                author.show_bibliography !== false && (

                    <div
                        className="
                            rounded-3xl
                            bg-zinc-950
                            border
                            border-zinc-800
                            p-5
                            space-y-5
                        "
                    >


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

                                        className="
                                            flex
                                            items-center
                                            gap-4
                                            p-4
                                            rounded-2xl
                                            bg-zinc-900
                                            border
                                            border-zinc-800
                                        "

                                    >


                                        <div
                                            className="
                                                w-10
                                                h-10
                                                rounded-xl
                                                bg-zinc-800
                                                flex
                                                items-center
                                                justify-center
                                                text-sm
                                                font-bold
                                                text-zinc-300
                                                shrink-0
                                            "
                                        >

                                            {index + 1}

                                        </div>




                                        <div
                                            className="
                                                flex-1
                                                min-w-0
                                            "
                                        >

                                            <p
                                                className="
                                                    font-medium
                                                    line-clamp-2
                                                "
                                            >

                                                {book.title}

                                            </p>


                                        </div>




                                        <div
                                            className="
                                                flex
                                                gap-2
                                                shrink-0
                                            "
                                        >

                                            <button

                                                type="button"

                                                onClick={() =>
                                                    moveBook(
                                                        index,
                                                        -1
                                                    )
                                                }


                                                className="
                                                    w-10
                                                    h-10
                                                    rounded-xl
                                                    bg-zinc-800
                                                    hover:bg-zinc-700
                                                    transition
                                                "

                                            >

                                                ↑

                                            </button>



                                            <button

                                                type="button"

                                                onClick={() =>
                                                    moveBook(
                                                        index,
                                                        1
                                                    )
                                                }


                                                className="
                                                    w-10
                                                    h-10
                                                    rounded-xl
                                                    bg-zinc-800
                                                    hover:bg-zinc-700
                                                    transition
                                                "

                                            >

                                                ↓

                                            </button>



                                        </div>


                                    </div>


                                ))

                            }



                            {
                                books.length === 0 && (

                                    <div
                                        className="
                                            py-8
                                            text-center
                                            text-zinc-500
                                            text-sm
                                        "
                                    >

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