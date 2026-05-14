"use client"

import Link from "next/link"

export default function AmazonButton({
  slug
}: {
  slug: string
}) {

  return (
    <Link
      href={`/go/${slug}`}
      className="
        inline-block
        mt-4
        bg-yellow-500
        hover:bg-yellow-400
        text-black
        px-3 py-1.5
        rounded-full
        font-medium
        text-sm
        transition
        whitespace-nowrap
      "
    >
      Ver en Amazon
    </Link>
  )
}