"use client"

import { HexColorPicker } from "react-colorful";
import { useState } from "react";

import {
    inter,
    merriweather,
    ibmMono,
    lora,
    cormorant,
    caveat,
    cinzel,
    ebGaramond,
    courierPrime,
    manrope,
    creepster
} from "@/lib/fonts";

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

    const [activeColor, setActiveColor] = useState<string | null>(null);


    return (
        <section>
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
                                p-3
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
                                className="font-semibold"
                                style={{
                                    color: preset.theme?.text
                                }}
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
                                p-2
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
                            <div className="relative">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveColor(
                                            activeColor === color.key
                                                ? null
                                                : color.key
                                        )
                                    }
                                    className="
            w-12
            h-12
            rounded-xl
            border
            border-zinc-700
            overflow-hidden
        "
                                    style={{
                                        backgroundColor: color.value
                                    }}
                                />


                                {activeColor === color.key && (

                                    <div
                                        className="
                absolute
                right-0
                top-14
                z-50
                p-3
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-700
                shadow-xl
            "
                                    >

                                        <HexColorPicker
                                            color={color.value}
                                            onChange={value =>
                                                updateTheme({
                                                    [color.key]: value
                                                })
                                            }
                                        />

                                    </div>

                                )}

                            </div>
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
                            className: inter.className
                        },
                        {
                            id: "serif",
                            name: "Clásica",
                            className: merriweather.className
                        },
                        {
                            id: "mono",
                            name: "Editorial",
                            className: ibmMono.className
                        },
                        {
                            id: "times",
                            name: "Novela",
                            className: lora.className
                        },
                        {
                            id: "garamond",
                            name: "Elegante",
                            className: cormorant.className
                        },
                        {
                            id: "cursive",
                            name: "Creativa",
                            className: caveat.className
                        },
                        {
                            id: "dark",
                            name: "Oscura",
                            className: cinzel.className
                        },
                        {
                            id: "old",
                            name: "Antigua",
                            className: ebGaramond.className
                        },
                        {
                            id: "typewriter",
                            name: "Máquina",
                            className: courierPrime.className
                        },
                        {
                            id: "fantasy",
                            name: "Fantasía",
                            className: cinzel.className
                        },
                        {
                            id: "horror",
                            name: "Terror",
                            className: creepster.className
                        },
                        {
                            id: "minimal",
                            name: "Minimal",
                            className: manrope.className
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
                                p-2
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
                                className={`text-lg ${font.className}`}
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