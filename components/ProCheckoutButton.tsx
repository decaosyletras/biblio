"use client"

import { FaCrown } from "react-icons/fa"

export default function ProCheckoutButton({
  authorId
}: {
  authorId: string
}) {

  async function startProCheckout() {

    const response = await fetch(
      "/api/stripe/create-checkout",
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

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
      return
    }

    alert(
      data.error ?? "No se pudo iniciar el pago"
    )
  }


  return (
    <button
      onClick={startProCheckout}
      className="
                inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500
                text-black font-bold
                hover:brightness-110
                transition
                whitespace-nowrap
                shadow-lg shadow-yellow-500/20
            "
    >
      <FaCrown />
      Activar PRO · $4
    </button>
  )
}