"use client"

import { useEffect, useState } from "react"

export function useAmazonCountry() {
  const [country, setCountry] = useState("US")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/geo")
        const data = await res.json()

        // 🔥 HARD OVERRIDE DE SEGURIDAD
        if (data.country === "ES" && !navigator.language.includes("es-es")) {
          // sospechoso → ignora geo
          setCountry("US")
          return
        }

        setCountry(data.country || "US")
      } catch {
        setCountry("US")
      }
    }

    load()
  }, [])

  return country
}