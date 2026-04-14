export default function ReviewMetrics({
  metrics,
}: {
  metrics: Record<string, number>
}) {
  return (
    <div className="space-y-3 mt-6">

      {Object.entries(metrics).map(([key, value]) => (
        <div key={key}>

          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize text-zinc-400">
              {key}
            </span>
            <span className="text-zinc-100">
              {value}/5
            </span>
          </div>

          {/* Barra */}
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>

        </div>
      ))}

    </div>
  )
}