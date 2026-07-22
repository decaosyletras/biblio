"use client"

import { useState } from "react"
import { FaCrown } from "react-icons/fa"

export default function ManageProButton({
  authorId
}: {
  authorId: string
}) {

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  /*
   * Implementacion anterior conservada como referencia.
   * Se comento porque no controlaba errores de red ni evitaba clics repetidos.
  async function managePro() {

    const response =
      await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            authorId
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
      "No se pudo abrir gestión PRO"
    )

  }
  */

  async function managePro() {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            authorId
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
          "No se pudo abrir la gestion PRO"
        )
      }

      window.location.assign(data.url)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo abrir la gestion PRO"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {errorMessage && (
        <p
          role="alert"
          className="text-sm text-red-400"
        >
          {errorMessage}
        </p>
      )}

      <button
        onClick={managePro}
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
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
      >
        <FaCrown />
        {loading ? "Abriendo..." : "Gestionar PRO"}
      </button>
    </div>
  )

}
