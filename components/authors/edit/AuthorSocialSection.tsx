"use client";

type Props = {
    author: any;
    socialOrder: string[];
    moveSocial: (index: number, direction: number) => void;
    updateField: (field: string, value: any) => void;
};

const labels: Record<string, string> = {
    website: "Sitio web",
    instagram: "Instagram",
    wattpad: "Wattpad",
    threads: "Threads",
    facebook: "Facebook",
    tiktok: "TikTok",
    youtube: "YouTube"
};

const placeholders: Record<string, string> = {
    website: "https://tuweb.com",
    instagram: "https://instagram.com/usuario",
    wattpad: "https://www.wattpad.com/user/usuario",
    threads: "https://threads.net/@usuario",
    facebook: "https://facebook.com/usuario",
    tiktok: "https://tiktok.com/@usuario",
    youtube: "https://youtube.com/@canal"
};

export default function AuthorSocialSection({
    author,
    socialOrder,
    moveSocial,
    updateField
}: Props) {
    return (

        <section
            className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-5 md:p-7 space-y-8"
        >

            {/* CABECERA */}

            <div>

                <div className="flex items-center gap-3">

                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-yellow-500/10 border border-yellow-500/20"
                    >
                        🔗
                    </div>


                    <div>

                        <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                            Redes sociales
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Añade tus enlaces y organiza cómo aparecerán en tu perfil.
                        </p>

                    </div>

                </div>

            </div>


            {/* REDES */}

            <div className="space-y-4">

                {socialOrder.map((social, index) => (

                    <div
                        key={social}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4"
                    >

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="font-semibold text-white">
                                    {labels[social] ?? social}
                                </p>

                                <p className="text-xs text-zinc-500 mt-1">
                                    Posición {index + 1}
                                </p>

                            </div>


                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    onClick={() => moveSocial(index, -1)}
                                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                                >
                                    ↑
                                </button>


                                <button
                                    type="button"
                                    onClick={() => moveSocial(index, 1)}
                                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                                >
                                    ↓
                                </button>

                            </div>

                        </div>


                        <input
                            value={author[social] ?? ""}
                            onChange={e =>
                                updateField(
                                    social,
                                    e.target.value
                                )
                            }
                            placeholder={
                                placeholders[social] ?? social
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
                        />

                    </div>

                ))}

            </div>

        </section>

    )
}