"use client"

import { FaCrown } from "react-icons/fa"

export default function ManageProButton({
  authorId
}: {
  authorId: string
}) {

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

  return (
    <button
      onClick={managePro}
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
      "
    >
      <FaCrown />
      Gestionar PRO
    </button>
  )

}