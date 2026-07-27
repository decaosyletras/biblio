"use client"

import { useState } from "react"
import { FaCrown } from "react-icons/fa"

type Currency = "usd" | "mxn" | "eur"
type Plan = "monthly" | "quarterly" | "semiannual"

const PLAN_PRICES: Record<Currency, Record<Plan, string>> = {
  usd: {
    monthly: "$2.99 USD",
    quarterly: "$7.99 USD",
    semiannual: "$14.99 USD",
  },
  mxn: {
    monthly: "$59 MXN",
    quarterly: "$149 MXN",
    semiannual: "$279 MXN",
  },
  eur: {
    monthly: "€2.99 EUR",
    quarterly: "€7.99 EUR",
    semiannual: "€14.99 EUR",
  },
}

export default function ProCheckoutButton({ authorId }: { authorId: string }) {
  const [currency, setCurrency] = useState<Currency>("usd")
  const [plan, setPlan] = useState<Plan>("monthly")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function startProCheckout() {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, plan, currency }),
      })

      const data = await response.json().catch(() => null) as {
        url?: string
        error?: string
      } | null

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "No se pudo iniciar el pago")
      }

      window.location.assign(data.url)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo iniciar el pago"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <select
        value={currency}
        disabled={loading}
        onChange={(event) => setCurrency(event.target.value as Currency)}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
        aria-label="Divisa"
      >
        <option value="usd">Dólares estadounidenses (USD)</option>
        <option value="mxn">Pesos mexicanos (MXN)</option>
        <option value="eur">Euros (EUR)</option>
      </select>

      <select
        value={plan}
        disabled={loading}
        onChange={(event) => setPlan(event.target.value as Plan)}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
        aria-label="Plan PRO"
      >
        <option value="monthly">Mensual · {PLAN_PRICES[currency].monthly}</option>
        <option value="quarterly">Trimestral · {PLAN_PRICES[currency].quarterly}</option>
        <option value="semiannual">Semestral · {PLAN_PRICES[currency].semiannual}</option>
      </select>

      <button
        onClick={startProCheckout}
        disabled={loading}
        className="
          inline-flex items-center justify-center gap-2
          px-5 py-3 rounded-xl
          bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500
          text-black font-bold
          hover:brightness-110 active:scale-95 transition-all duration-150
          whitespace-nowrap shadow-lg shadow-yellow-500/20 disabled:opacity-60
        "
      >
        <FaCrown />
        {loading ? "Procesando..." : "Activar PRO"}
      </button>
    </div>
  )
}
