"use client";

type Props = {
    author: any;
    updateField: (
        field: string,
        value: any
    ) => void;
};

export default function AuthorBookSettingsSection({
    author,
    updateField
}: Props) {

    return (
        <section>

            <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-yellow-500/10 border border-yellow-500/20">
                    ⚙️
                </div>

                <div>

                    <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                        Opciones de libros
                    </h2>

                    <p className="text-sm text-zinc-400 mt-1">
                        Personaliza cómo se muestran tus libros.
                    </p>

                </div>

            </div>


            <div className="mt-6 rounded-3xl bg-zinc-950 border border-zinc-800 p-5">

                <label className="flex items-center gap-3 cursor-pointer">

                    <input
                        type="checkbox"
                        checked={author.show_book_details}
                        onChange={e =>
                            updateField(
                                "show_book_details",
                                e.target.checked
                            )
                        }
                        className="w-5 h-5 accent-yellow-500"
                    />

                    <span className="text-sm text-zinc-300">
                        Mostrar botón "Ver detalles" en los libros
                    </span>

                </label>

            </div>

        </section>
    );
}
