export default function ReviewGenres({
  genres,
}: {
  genres: Record<string, number>
}) {
  return (
    <div className="mt-6 space-y-3">

      {Object.entries(genres).map(([key, value]) => (
        <div key={key}>

          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize text-zinc-400">
              {key}
            </span>
            <span className="text-zinc-100">
              {value}/5
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400"
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>

        </div>
      ))}

    </div>
  )
}