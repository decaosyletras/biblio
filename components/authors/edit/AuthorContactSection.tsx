"use client";

type Props = {
    author: any;
    accountEmail: string;
    updateField: (
        field: string,
        value: any
    ) => void;
};

export default function AuthorContactSection({
    author,
    accountEmail,
    updateField
}: Props) {
    return (
        <section>

            {/* CABECERA */}

            <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-yellow-500/10 border border-yellow-500/20">
                    ✉️
                </div>

                <div>

                    <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                        Correo de contacto
                    </h2>

                    <p className="text-sm text-zinc-400 mt-1">
                        Este correo aparecerá en tu página pública para que los lectores puedan ponerse en contacto contigo.
                    </p>

                </div>

            </div>


            {/* CONTENIDO */}

            <div className="mt-6 space-y-5">

                <input
                    type="email"
                    value={author.contact_email ?? ""}
                    onChange={e =>
                        updateField(
                            "contact_email",
                            e.target.value
                        )
                    }
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-3"
                />

                {author.contact_email ? (

                    <p className="text-sm text-zinc-500">
                    </p>

                ) : (

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">

                        <div>

                            <p className="text-sm text-zinc-300">
                                No has configurado un correo de contacto.
                            </p>

                            <p className="text-xs text-zinc-500 mt-1">
                                Si lo deseas, puedes utilizar el correo asociado a tu cuenta o escribir uno diferente.
                            </p>

                        </div>

                        {accountEmail && (

                            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">

                                <p className="text-xs text-zinc-500">
                                    Correo de tu cuenta
                                </p>

                                <p className="text-sm text-zinc-200 mt-1 break-all">
                                    {accountEmail}
                                </p>

                            </div>

                        )}

                        {accountEmail && (

                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        "contact_email",
                                        accountEmail
                                    )
                                }
                                className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition"
                            >
                                Usar este correo
                            </button>

                        )}

                    </div>


                )}

            </div>

        </section>
    );
}
