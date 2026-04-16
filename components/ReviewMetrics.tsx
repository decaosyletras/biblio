import { metricsCatalog } from "@/data/metrics"

export default function ReviewMetrics({
  metrics,
}: {
  metrics: { id: number; value: number }[]
}) {
  // 🔥 unir catálogo + valores
  const enriched = metrics.map((m) => {
    const meta = metricsCatalog.find((c) => c.id === m.id)

    return {
      label: meta?.label || "Métrica",
      value: m.value,
    }
  })

  // 🔥 ordenar de mayor a menor
  const sorted = enriched.sort((a, b) => b.value - a.value)

  return (
    <div className="mt-6 space-y-4">

      {sorted.map((m, i) => (
        <div key={i}>

          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">
              {m.label}
            </span>

            <span className="text-zinc-100 font-medium">
              {m.value}/10
            </span>
          </div>

          {/* barra */}
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${(m.value / 10) * 100}%` }}
            />
          </div>

        </div>
      ))}

    </div>
  )
}