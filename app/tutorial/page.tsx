import Link from "next/link"

export default function TutorialPage() {
    const steps = [
        {
            number: "01",
            title: "Crea tu cuenta",
            icon: "👤",
            text:
                "Regístrate para tener acceso a tu perfil. Desde tu cuenta podrás reclamar tus libros y gestionar tu página de autor."
        },
        {
            number: "02",
            title: "Encuentra tu libro",
            icon: "📚",
            text:
                "Busca tu libro en el catálogo. Cuando encuentres una obra tuya, podrás solicitar la reclamación de autoría. Solo pedimos que nos cuentes un poco sobre tu autoría y que dejes un link a alguna red social para hacer una breve revisión."
        },
        {
            number: "03",
            title: "Reclama tu autoría",
            icon: "✍️",
            text:
                "Pulsa en «Reclamar autor» para solicitar acceso a tu página de autor. Revisaremos la solicitud antes de activarla. (Basta con reclamar un solo libro, los demás asignados a ese autor se te asignarán automáticamente)."
        },
        {
            number: "04",
            title: "Completa tu página de autor",
            icon: "📝",
            text:
                "Una vez aprobada tu solicitud podrás añadir tu biografía, imagen de perfil y la información principal que verán tus lectores."
        },
        {
            number: "05",
            title: "Personaliza con PRO (opcional)",
            icon: "⭐",
            text:
                "Con PRO podrás darle una identidad propia a tu página: colores, estilo visual, redes sociales, banner y novedades. "
        }
    ]

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">

            <section className="max-w-4xl mx-auto px-6 py-16">

                {/* HERO */}

                <div className="text-center">

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Cómo crear tu página de autor
                    </h1>

                    <p className="mt-5 text-zinc-400 text-lg max-w-2xl mx-auto">
                        Sigue estos pasos para reclamar tus libros,
                        crear tu perfil y conectar con nuevos lectores.
                    </p>

                </div>


                {/* PASOS */}

                <div className="mt-14 space-y-5">

                    {steps.map(step => (

                        <div
                            key={step.number}
                            className="
                                rounded-3xl
                                bg-zinc-900
                                border
                                border-zinc-800
                                p-6
                                flex
                                gap-5
                                items-start
                            "
                        >

                            <div
                                className="
                                    shrink-0
                                    w-12
                                    h-12
                                    rounded-2xl
                                    bg-yellow-500/10
                                    border
                                    border-yellow-500/30
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                "
                            >
                                {step.icon}
                            </div>


                            <div>

                                <div className="text-yellow-400 text-sm font-bold">
                                    PASO {step.number}
                                </div>

                                <h2 className="text-xl font-semibold mt-1">
                                    {step.title}
                                </h2>

                                <p className="text-zinc-400 mt-2 leading-relaxed">
                                    {step.text}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>


                {/* CAMINO */}

                <section
                    className="
                        mt-14
                        rounded-3xl
                        border
                        border-yellow-500/20
                        bg-yellow-500/5
                        p-8
                    "
                >

                    <h2 className="text-2xl font-semibold">
                        Tu camino como autor
                    </h2>


                    <div
                        className="
                            mt-6
                            flex
                            flex-col
                            md:flex-row
                            items-center
                            justify-between
                            gap-3
                            text-center
                            text-sm
                        "
                    >

                        {[
                            "Crear cuenta",
                            "Buscar libro",
                            "Reclamar autoría",
                            "Completar perfil",
                            "Personalizar"
                        ].map((item, index) => (

                            <div key={item} className="flex items-center gap-3">

                                <div
                                    className="
                                        px-4
                                        py-3
                                        rounded-full
                                        bg-zinc-900
                                        border
                                        border-zinc-700
                                        whitespace-nowrap
                                    "
                                >
                                    {item}
                                </div>

                                {index < 4 && (
                                    <span className="hidden md:block text-yellow-500">
                                        →
                                    </span>
                                )}

                            </div>

                        ))}

                    </div>

                </section>


                {/* PRO */}

                <section className="mt-14 text-center">

                    <h2 className="text-2xl font-semibold">
                        ¿Quieres destacar más?
                    </h2>

                    <div className="mt-3 text-zinc-400 max-w-xl mx-auto space-y-4 leading-relaxed">
                        <p>
                            Tu página estará enfocada únicamente en tu obra: tus libros, tu información
                            como autor y todo aquello que quieras compartir con tus lectores. No tendrá
                            menús ni elementos externos que distraigan la atención, para que al compartir
                            tu enlace la experiencia se sienta más como una página propia.
                        </p>

                        <p>
                            Únicamente nos limitamos a mantener una referencia discreta a la Cas(z)a de Libros Indie en el pie de página, para que tus lectores puedan conocer también el proyecto que hace posible este espacio.
                        </p>
                        
                        <p>
                            Además, con PRO, tu página de autor se convierte en un espacio más personal,
                            profesional y preparado para conectar con tus lectores.
                        </p>

                        <p>
                            Sabemos que crear y mantener una página web propia no siempre está al
                            alcance de todos los escritores. Por eso PRO te ofrece un espacio
                            profesional donde tener presencia online, personalizar tu página, poner tus redes sociales y un link externo, presentar novedades, y dar a tus libros la visibilidad que merecen, sin necesidad de construir una web desde cero.
                        </p>

                        <p>
                            Además, al formar parte de PRO estás apoyando directamente este proyecto
                            y ayudando a que podamos seguir creando nuevas herramientas y mejoras
                            para autores y lectores.
                        </p>

                        <p>
                            Independientemente del uso que quieras darle a tu página de autor, queremos
                            darte las gracias por confiar en este proyecto. Cada autor que se suma nos
                            ayuda a seguir construyendo un espacio donde más historias puedan ser
                            descubiertas.
                        </p>
                    </div>

                </section>


                {/* AYUDA */}

                <section className="mt-16 text-center">

                    <p className="text-zinc-500 text-sm">
                        ¿Tienes dudas o necesitas ayuda?
                    </p>

                    <Link
                        href="/conoceme"
                        className="
                            inline-block
                            mt-3
                            text-yellow-400
                            hover:underline
                        "
                    >
                        Contactar
                    </Link>

                </section>


            </section>

        </main>
    )
}