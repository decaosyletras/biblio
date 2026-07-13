"use client"

interface Props {
    author: any
    setAuthor: any
}

export default function AuthorThemeSection({
    author,
    setAuthor
}: Props) {


    function updateTheme(
        values: any
    ) {

        setAuthor((prev: any) => ({
            ...prev,

            theme: {
                ...(prev.theme ?? {}),
                ...values
            }

        }))

    }



    const presets = [

        {
            id: "dark",

            name: "Oscuro",

            preview:
                "bg-zinc-950",

            theme: {
                bg: "#09090b",
                surface: "#18181b",
                primary: "#aba3a3",
                text: "#ffffff",
                muted: "#888890",
                border: "#27272a"
            }

        },


        {
            id: "cream",

            name: "Crema",

            preview:
                "bg-amber-50",

            theme: {
                bg: "#faf7f0",
                surface: "#ffffff",
                primary: "#b6622d",
                text: "#373230",
                muted: "#78716c",
                border: "#d6d3d1"
            }

        },


        {
            id: "fantasy",

            name: "Fantasía",

            preview:
                "bg-emerald-950",

            theme: {
                bg: "#071a12",
                surface: "#143b2b",
                primary: "#157b59",
                text: "#ecfdf5",
                muted: "#ccf9e4",
                border: "#065f46"
            }

        },


        {
            id: "romantic",

            name: "Romántico",

            preview:
                "bg-rose-400",

            theme: {
                bg: "#f5b9de",
                surface: "#e0409a",
                primary: "#b53c79",
                text: "#fff1f2",
                muted: "#fda4af",
                border: "#a81e45"
            }

        }

    ]



    const colors = [

        {
            key: "bg",
            label: "Fondo de página",
            value:
                author.theme?.bg ?? "#09090b"
        },

        {
            key: "surface",
            label: "Tarjetas",
            value:
                author.theme?.surface ?? "#18181b"
        },

        {
            key: "primary",
            label: "Color principal",
            value:
                author.theme?.primary ?? "#2563eb"
        },

        {
            key: "text",
            label: "Texto principal",
            value:
                author.theme?.text ?? "#ffffff"
        },

        {
            key: "muted",
            label: "Texto secundario",
            value:
                author.theme?.muted ?? "#a1a1aa"
        },

        {
            key: "border",
            label: "Bordes",
            value:
                author.theme?.border ?? "#27272a"
        }

    ]



    return (

        <section
            className="
                rounded-3xl
                border
                border-yellow-500/20
                bg-zinc-900
                p-5
                md:p-7
                space-y-8
            "
        >

            <div>

                <h2
                    className="
                        text-xl
                        md:text-2xl
                        font-bold
                        text-yellow-400
                    "
                >
                    🎨 Personalización visual
                </h2>


                <p className="text-sm text-zinc-400 mt-2">
                    Ajusta la identidad visual de tu página de autor.
                </p>

            </div>



            {/* PRESETS */}

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

                <h3 className="font-semibold">
                    Estilos rápidos
                </h3>


                <div
                    className="
                        grid
                        grid-cols-2
                        gap-3
                    "
                >

                    {presets.map(preset => (

                        <button

                            key={preset.id}

                            type="button"

                            onClick={() =>
                                updateTheme(
                                    preset.theme
                                )
                            }

                            className={`
                                p-4
                                rounded-2xl
                                border
                                transition
                                text-left
                                ${preset.preview}
                                border-zinc-700
                                hover:border-blue-500
                                hover:scale-[1.02]
                            `}

                        >

                            <p
                                className={`
                                font-semibold
                                ${preset.theme?.text}
                            `}
                            >
                                {preset.name}
                            </p>

                        </button>

                    ))}

                </div>


            </div>

            {/* COLORES */}

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

                <h3 className="font-semibold">
                    Colores personalizados
                </h3>


                <div
                    className="
                        grid
                        sm:grid-cols-2
                        gap-4
                    "
                >

                    {colors.map(color => (

                        <div
                            key={color.key}
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-4
                                rounded-2xl
                                bg-zinc-900
                                border
                                border-zinc-800
                            "
                        >

                            <div>

                                <p className="font-medium">
                                    {color.label}
                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-zinc-500
                                        uppercase
                                        mt-1
                                    "
                                >
                                    {color.value}
                                </p>

                            </div>


                            <input

                                type="color"

                                value={color.value}

                                onChange={e =>
                                    updateTheme({

                                        [color.key]:
                                            e.target.value

                                    })
                                }

                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    cursor-pointer
                                    border
                                    border-zinc-700
                                    overflow-hidden
                                "

                            />


                        </div>

                    ))}


                </div>


            </div>



            {/* TIPOGRAFÍAS */}


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

                <h3 className="font-semibold">
                    Estilo de letra
                </h3>


                <div
                    className="
                        grid
                        grid-cols-2
                        gap-3
                    "
                >

                    {[

                        {
                            id: "sans",
                            name: "Moderna",
                            font: "Arial, sans-serif"
                        },

                        {
                            id: "serif",
                            name: "Clásica",
                            font: "Georgia, serif"
                        },

                        {
                            id: "mono",
                            name: "Editorial",
                            font: "ui-monospace, monospace"
                        },

                        {
                            id: "times",
                            name: "Novela",
                            font: "Times New Roman, serif"
                        },

                        {
                            id: "garamond",
                            name: "Elegante",
                            font: "Garamond, serif"
                        },

                        {
                            id: "cursive",
                            name: "Creativa",
                            font: "cursive"
                        },

                        {
                            id: "dark",
                            name: "Oscura",
                            font: "Palatino Linotype, Book Antiqua, serif"
                        },

                        {
                            id: "old",
                            name: "Antigua",
                            font: "Baskerville, serif"
                        },

                        {
                            id: "typewriter",
                            name: "Máquina",
                            font: "Courier New, monospace"
                        },

                        {
                            id: "fantasy",
                            name: "Fantasía",
                            font: "Papyrus, fantasy"
                        },

                        {
                            id: "horror",
                            name: "Terror",
                            font: "Chiller, Impact, fantasy"
                        },

                        {
                            id: "minimal",
                            name: "Minimal",
                            font: "Helvetica, Arial, sans-serif"
                        }

                    ].map(font => (

                        <button

                            key={font.id}

                            type="button"

                            onClick={() =>
                                updateTheme({
                                    font: font.id
                                })
                            }

                            className={`
                                p-4
                                rounded-xl
                                border
                                text-left
                                transition

                                ${author.theme?.font === font.id

                                    ?
                                    "border-blue-500 bg-blue-500/10"

                                    :

                                    "border-zinc-700 bg-zinc-900"
                                }

                            `}

                        >

                            <p
                                className="
                                    text-lg
                                "
                                style={{
                                    fontFamily:
                                        font.font
                                }}
                            >
                                Aa Escritura
                            </p>


                            <p className="text-xs text-zinc-400 mt-2">
                                {font.name}
                            </p>


                        </button>

                    ))}


                </div>


            </div>


        </section>

    )

}