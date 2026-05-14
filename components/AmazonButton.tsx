"use client"

import Link from "next/link"

export default function AmazonButton({
  slug
}: {
  slug: string
}) {

  return (
    <Link href={`/go/${slug}`}>
      Ver en Amazon
    </Link>
  )
}