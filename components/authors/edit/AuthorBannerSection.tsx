"use client";

type Props = {
    author: any;
    updateField: (field: string, value: any) => void;
    setBannerFile: (file: File | null) => void;
};

export default function AuthorBannerSection({
    author,
    updateField,
    setBannerFile
}: Props) {
    return (
        <section>

            {/* CABECERA */}

            <div>

                <div className="flex items-center gap-3">

                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-yellow-500/10 border border-yellow-500/20"
                    >
                        🖼️
                    </div>


                    <div>

                        <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                            Banner del perfil
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Personaliza la imagen principal de tu página de autor.
                        </p>

                    </div>

                </div>

            </div>


            {/* CONTENIDO */}

            <div className="space-y-6">

                <p className="text-sm text-zinc-500">
                    Recomendado: imagen horizontal de{" "}
                    <strong className="text-zinc-300">
                        1600 × 500 px
                    </strong>.
                </p>

                <p className="text-sm text-zinc-500">
                    Opcional. Puedes publicar la novedad sin una imagen.
                </p>


                <label
                    className="
                    group
                    relative
                    block
                    overflow-hidden
                    rounded-3xl
                    border-2
                    border-dashed
                    border-zinc-700
                    bg-zinc-950
                    cursor-pointer
                    transition
                    hover:border-yellow-500/50
                "
                >

                    {author.banner ? (

                        <>

                            <img
                                src={author.banner}
                                className="
                                w-full
                                aspect-[16/5]
                                object-cover
                                transition
                                duration-500
                                group-hover:scale-[1.02]
                            "
                            />


                            <div
                                className="
                                absolute
                                inset-0
                                bg-black/50
                                opacity-0
                                group-hover:opacity-100
                                transition
                                flex
                                items-center
                                justify-center
                            "
                            >

                                <div
                                    className="
                                    px-5
                                    py-3
                                    rounded-2xl
                                    bg-yellow-500/10
                                    backdrop-blur
                                    border
                                    border-yellow-500/30
                                    text-yellow-300
                                    font-medium
                                "
                                >
                                    Cambiar banner
                                </div>

                            </div>

                        </>

                    ) : (

                        <div
                            className="
                            aspect-[16/5]
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            px-8
                        "
                        >

                            <p className="font-semibold text-white">
                                Haz clic para subir un banner
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

                            const file = e.target.files?.[0];

                            if (!file) return;

                            setBannerFile(file);

                            updateField(
                                "banner",
                                URL.createObjectURL(file)
                            );

                        }}
                    />

                </label>


                {author.banner && (

                    <button
                        type="button"
                        onClick={() =>
                            updateField(
                                "banner",
                                null
                            )
                        }
                        className="
                        w-full
                        py-3
                        rounded-2xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        text-red-400
                        hover:bg-red-500/20
                        transition
                    "
                    >
                        Eliminar banner
                    </button>

                )}

            </div>


        </section>
    );
}