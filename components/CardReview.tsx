"use client"

import React from "react"
import Link from "next/link"
import { tagsCatalog } from "@/data/tags"
import { getBookCover } from "@/lib/amazon"

export default function CardReview({ book }: any) {

  function getTopTags(tags: any) {

    return Object.entries(tags)
      .sort(
        (a: any, b: any) =>
          b[1] - a[1]
      )
      .slice(0, 2)
  }

  function formatLabel(text: string) {

    return text
      .replace(/([A-Z])/g, " $1")
      .replace(
        /^./,
        (str) => str.toUpperCase()
      )
  }

  const topTags =
    getTopTags(book.tags)

  return (
    <div
      className="
        bg-zinc-900
        p-4
        rounded-xl
        hover:bg-zinc-800
        transition
      "
    >

      <Link href={`/libros/${book.slug}`}>

        <div className="flex gap-4">

          <img
            src={getBookCover(book.amazon, book.cover)}
            alt={book.title}
            className="
              w-20
              h-32
              object-cover
              rounded-xl
            "
            onError={(
              e: React.SyntheticEvent<
                HTMLImageElement
              >
            ) => {
              e.currentTarget.src =
                "/placeholder-book.jpg"
            }}
          />

          <div>

            <h3
              className="
                text-lg
                font-semibold
                text-zinc-100
              "
            >
              {book.title}
            </h3>

            <p
              className="
                text-sm
                text-zinc-400
                mt-1
              "
            >
              {book.review.excerpt}
            </p>

          </div>

        </div>

      </Link>

      <div
        className="
          mt-4
          flex
          gap-2
          flex-wrap
        "
      >

        {topTags.map(
          ([key, value]: any) => {

            const text =
              (
                tagsCatalog as Record<
                  string,
                  string[]
                >
              )[key][value]

            return (
              <Link
                key={key}
                href={`/libros/${book.slug}`}
              >

                <span
                  className="
                    text-xs
                    bg-blue-400/20
                    text-blue-300
                    px-3
                    py-1
                    rounded-full
                    hover:bg-blue-400/30
                    transition
                  "
                >
                  {formatLabel(key)}:
                  {" "}
                  {text}
                </span>

              </Link>
            )
          }
        )}

      </div>

    </div>
  )
}