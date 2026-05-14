"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"

import { books } from "@/data/books"
import { generateAmazonLink } from "@/lib/amazon"

export default function GoPage() {

  const params = useParams()

  const book = books.find(
    b => b.slug === params.slug
  )

  useEffect(() => {

    if (!book) return

    let country = "US"

    const lang =
      navigator.language.toLowerCase()

    /*if (lang.includes("es-mx")) {
      country = "MX"
    }
    else */if (lang.includes("es-es")) {
      country = "ES"
    }

    const url =
      generateAmazonLink(
        book.amazon,
        country
      )

    // IMPORTANTE:
    window.location.replace(url)

  }, [book])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Redirigiendo a Amazon...
    </div>
  )
}