"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

function getRegistrationError(error: {
    code?: string
    status?: number
}) {
    if (
        error.status === 429 ||
        error.code === "over_email_send_rate_limit" ||
        error.code === "over_request_rate_limit"
    ) {
        return "Se han realizado demasiados intentos. Espera unos minutos e intentalo de nuevo."
    }

    switch (error.code) {
        case "weak_password":
            return "La contrasena no cumple los requisitos de seguridad. Usa una combinacion mas larga con letras, numeros y simbolos."
        case "email_address_invalid":
            return "El correo electronico no tiene un formato valido."
        case "signup_disabled":
            return "El registro de nuevas cuentas no esta disponible en este momento."
        case "user_already_exists":
            // Se mantiene generico para no revelar si un correo ya tiene cuenta.
            return "No se pudo completar el registro. Revisa los datos e intentalo de nuevo."
        default:
            return "No se pudo completar el registro. Revisa los datos e intentalo de nuevo."
    }
}

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const router = useRouter()

    const register = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")

        if (!aceptaTerminos) {
            alert("Debes aceptar la Política de Privacidad y los Términos de Uso")
            return
        }

        setLoading(true)

        const normalizedEmail = email.trim().toLowerCase()

        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
        })

        // Se comento aqui porque el registro aun debe guardar el consentimiento.
        // Mantener el estado de carga evita que el formulario se envie dos veces.
        // setLoading(false)

        if (error) {
            setLoading(false)

            // Se comento para no exponer mensajes internos de Supabase ni facilitar
            // la enumeracion de cuentas desde la interfaz.
            // alert(error.message)
            /* Se conserva comentado el mensaje anterior porque quedo con una
               codificacion incorrecta durante el primer intento de parche.
            setErrorMsg(
                error.status === 429
                    ? "Se han realizado demasiados intentos. Espera unos minutos e intÃ©ntalo de nuevo."
                    : "No se pudo completar el registro. Revisa los datos e intÃ©ntalo de nuevo."
            )
            */
            // Se comento porque solo distinguia el limite de intentos y ocultaba
            // avisos utiles como contrasena debil o correo invalido.
            // setErrorMsg(
            //     error.status === 429
            //         ? "Se han realizado demasiados intentos. Espera unos minutos e int\u00e9ntalo de nuevo."
            //         : "No se pudo completar el registro. Revisa los datos e int\u00e9ntalo de nuevo."
            // )
            setErrorMsg(getRegistrationError(error))
            return
        }

        const response = await fetch("/api/user-consents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: data.user?.id,
                aceptaTerminos
            })
        })


        // Se comento porque ya no se muestra directamente el detalle interno
        // devuelto por la API de consentimientos.
        // const result = await response.json()


        if (!response.ok) {
            setLoading(false)

            // Se comento para evitar mostrar directamente detalles devueltos por la API.
            // alert(result.error)
            /* Se conserva comentado el mensaje anterior porque quedo con una
               codificacion incorrecta durante el primer intento de parche.
            setErrorMsg("La cuenta se creÃ³, pero no pudimos guardar el consentimiento. IntÃ©ntalo de nuevo.")
            */
            setErrorMsg("La cuenta se cre\u00f3, pero no pudimos guardar el consentimiento. Contacta con soporte.")
            return
        }

        setLoading(false)

        // Se comento para que el correo no quede expuesto en la URL, el historial
        // del navegador, registros de acceso o herramientas de analitica.
        // router.push(
        //     `/register/success?email=${encodeURIComponent(normalizedEmail)}`
        // )
        router.push("/register/success")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

                <h1 className="text-2xl font-bold mb-6">
                    Crear cuenta
                </h1>

                <form
                    onSubmit={register}
                    className="space-y-4"
                >

                    <input
                        className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
                        type="password"
                        required
                        minLength={8}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="register-password-help"
                    />

                    <p
                        id="register-password-help"
                        className="text-xs leading-relaxed text-zinc-400"
                    >
                        Usa al menos 8 caracteres. Para mayor seguridad combina
                        letras, numeros y simbolos.
                    </p>

                    <label className="
                        flex
                        items-start
                        gap-3
                        text-sm
                        text-zinc-300
                    ">

                        <input
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                            className="mt-1"
                        />

                        <span>
                            He leído y acepto la{" "}

                            <Link
                                href="/privacidad"
                                target="_blank"
                                className="text-yellow-400 hover:underline"
                            >
                                Política de Privacidad
                            </Link>

                            {" "}y los{" "}

                            <Link
                                href="/uso"
                                target="_blank"
                                className="text-yellow-400 hover:underline"
                            >
                                Términos de Uso
                            </Link>

                        </span>

                    </label>


                    <button
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-semibold disabled:opacity-50"
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>

                </form>

                {errorMsg && (
                    <p
                        role="alert"
                        aria-live="polite"
                        className="mt-4 text-sm text-red-400"
                    >
                        {errorMsg}
                    </p>
                )}

                <p className="text-sm text-zinc-400 mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        href="/login"
                        className="text-blue-400"
                    >
                        Inicia sesión
                    </Link>
                </p>

            </div>
        </div>
    )
}
