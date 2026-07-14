"use client";

type Props = {
    author: any;
    updateField: (field: string, value: any) => void;
    setAvatarFile: (file: File | null) => void;
};

export default function AuthorBasicSection({
    author,
    updateField,
    setAvatarFile
}: Props) {
    return (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden">

            <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-xl font-bold text-white">
                    Información básica
                </h2>

                <p className="text-sm text-zinc-400 mt-1">
                    Esta información aparecerá en tu perfil público de autor.
                </p>
            </div>

            <div className="p-6 space-y-8">

                {/* Avatar */}

                <div>

                    <label className="block text-sm font-medium text-zinc-300 mb-4">
                        Foto de perfil
                    </label>

                    <label
                        className="group flex flex-col sm:flex-row gap-6 items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-5 cursor-pointer transition hover:border-blue-500"
                    >

                        <div className="relative">

                            <img
                                src={author.avatar || "/avatars/default.jpg"}
                                className="w-32 h-32 rounded-3xl object-cover border border-zinc-700"
                            />

                            <div
                                className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            >
                                <span
                                    className="text-xs px-3 py-2 rounded-xl bg-white/10 backdrop-blur"
                                >
                                    Cambiar
                                </span>
                            </div>

                        </div>

                        <div className="flex-1 text-center sm:text-left">

                            <p className="font-medium">
                                Foto del autor
                            </p>

                            <p className="text-sm text-zinc-500 mt-2">
                                Recomendado: imagen cuadrada de al menos 500×500 px.
                            </p>

                            <p className="text-xs text-zinc-600 mt-1">
                                PNG, JPG o WEBP
                            </p>

                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {

                                const file = e.target.files?.[0];

                                if (!file) return;

                                setAvatarFile(file);

                                updateField(
                                    "avatar",
                                    URL.createObjectURL(file)
                                );

                            }}
                        />

                    </label>

                </div>

                {/* Bio */}

                <div>

                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Biografía
                    </label>

                    <textarea
                        rows={7}
                        maxLength={900}
                        value={author.bio ?? ""}
                        onChange={e =>
                            updateField("bio", e.target.value)
                        }
                        placeholder="Cuéntale a los lectores quién eres, cómo empezaste a escribir, qué tipo de historias disfrutas crear..."
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4 resize-none leading-7"
                    />

                </div>

                {/* Estilo */}

                <div>

                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Estilo literario
                    </label>

                    <input
                        value={author.style ?? ""}
                        maxLength={70}
                        onChange={e =>
                            updateField("style", e.target.value)
                        }
                        placeholder="Ej. Fantasía épica, thriller psicológico, romance contemporáneo..."
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4"
                    />

                    <p className="text-xs text-zinc-500 mt-2">
                        Una frase corta que ayude a los lectores a identificar tu estilo.
                    </p>

                </div>

            </div>

        </section>
    );
}