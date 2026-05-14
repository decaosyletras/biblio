import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { books } from "@/data/books"
import { generateAmazonLink } from "@/lib/amazon"

export default async function GoPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {

  const { slug } = await params

  const book = books.find(b => b.slug === slug)

  if (!book) {
    redirect("/")
  }

  // Detectar país desde headers (más fiable que navigator)
  const h = await headers()
  const lang = h.get("accept-language")?.toLowerCase() || ""

  let country = "US"

  if (lang.includes("es-es")) {
    country = "ES"
  }
  /*else if (lang.includes("es-mx")) {
    country = "MX"
  }*/

  const url = generateAmazonLink(
    book.amazon,
    country
  )

  redirect(url)
}