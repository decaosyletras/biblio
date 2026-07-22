"use client"

import { useState } from "react"
import { FaCrown } from "react-icons/fa"

export default function ProCheckoutButton({
  authorId
}: {
  authorId: string
}) {

  const [plan, setPlan] =
    useState<
      "monthly" |
      "quarterly" |
      "semiannual"
    >("monthly")


  const [loading, setLoading] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState("")


  /*
   * Implementacion anterior conservada como referencia.
   * Se comento porque no controlaba errores de red ni respuestas no JSON.
  async function startProCheckout() {

    setLoading(true)

    const response =
      await fetch(
        "/api/stripe/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            authorId,
            plan
          })
        }
      )


    const data =
      await response.json()


    if (data.url) {

      window.location.href =
        data.url

      return
    }


    alert(
      data.error ??
      "No se pudo iniciar el pago"
    )


    setLoading(false)

  }
  */

  async function startProCheckout() {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(
        "/api/stripe/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            authorId,
            plan
          })
        }
      )

      const data = await response
        .json()
        .catch(() => null) as {
          url?: string
          error?: string
        } | null

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.error ??
          "No se pudo iniciar el pago"
        )
      }

      window.location.assign(data.url)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el pago"
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex flex-col gap-3">

      {errorMessage && (
        <p
          role="alert"
          className="text-sm text-red-400"
        >
          {errorMessage}
        </p>
      )}

      <select
        value={plan}
        disabled={loading}
        onChange={(e) =>
          setPlan(
            e.target.value as
            "monthly" |
            "quarterly" |
            "semiannual"
          )
        }
        className="
          rounded-xl
          px-4 py-3
          bg-zinc-900
          border border-zinc-700
          text-white
        "
      >
        <option value="monthly">
          Mensual · $2.99 USD
        </option>

        <option value="quarterly">
          Trimestral · $7.99 USD
        </option>

        <option value="semiannual">
          Semestral · $14.99 USD
        </option>

      </select>


      <button
        onClick={startProCheckout}
        disabled={loading}
        className="
          inline-flex items-center justify-center gap-2
          px-5 py-3 rounded-xl
          bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500
          text-black font-bold
          hover:brightness-110
          active:scale-95
          transition-all
          duration-150
          whitespace-nowrap
          shadow-lg shadow-yellow-500/20
          disabled:opacity-60
        "
      >

        <FaCrown />

        {
          loading
            ? "Procesando..."
            : "Activar PRO"
        }

      </button>

    </div>
  )
}
