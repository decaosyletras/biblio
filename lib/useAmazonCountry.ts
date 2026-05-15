"use client"

import { useEffect, useState } from "react"

export function useAmazonCountry() {
  const [country, setCountry] = useState("US")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/geo")
        const data = await res.json()
        setCountry(data.country || "US")
      } catch {
        setCountry("US")
      }
    }

    load()
  }, [])

  return country
}