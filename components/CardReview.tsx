import Link from "next/link"
import { Book } from "@/types"
import { metricsCatalog } from "@/data/metrics"

export default function CardReview({ book }: { book: Book }) {

  // 🔥 unir métricas con catálogo
  const enriched = book.review.metrics.map((m) => {
    const meta = metricsCatalog.find(c => c.id === m.id)

    return {
      label: meta?.label || "Métrica",
      value: m.value
    }
  })

  // 🔥 ordenar y tomar top 3
  const top3 = enriched
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  return (
    <Link href={`/resenas/${book.slug}`}>
      <div className="bg-zinc-900 p-4 rounded-xl hover:bg-zinc-800 transition cursor-pointer">

        <img
          src={book.cover}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />

        <h3 className="text-lg font-semibold text-zinc-100">
          {book.title}
        </h3>

        {/* 🔥 TOP MÉTRICAS */}
        <div className="mt-3 space-y-1">
          {top3.map((m, i) => (
            <p key={i} className="text-sm text-zinc-400">
              ⭐ {m.label}: <span className="text-zinc-100">{m.value}/10</span>
            </p>
          ))}
        </div>

      </div>
    </Link>
  )
}