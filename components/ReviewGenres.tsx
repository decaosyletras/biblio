export default function ReviewGenres({
  genre,
}: {
  genre: Record<string, string>
}) {
  return (
    <div className="mt-6 space-y-3">

      {Object.entries(genre).map(([key, value]) => (
        <div key={key}>

          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize text-zinc-400">
              {key}
            </span>
            <span className="text-zinc-100">
              {value}/10
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400"
              
            />
          </div>

        </div>
      ))}

    </div>
  )
}