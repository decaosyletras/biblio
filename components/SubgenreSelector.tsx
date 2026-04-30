"use client"

export default function SubgenreSelector({
  genresCatalog,
  selectedGenres,
  selectedSubgenres,
  setSelectedSubgenres
}: any) {

  const maxSubgenres =
    selectedGenres.length === 3 ? 5 :
    selectedGenres.length === 2 ? 6 :
    7

  const availableSubgenres = genresCatalog
    .filter((g: any) => selectedGenres.includes(g.id))
    .flatMap((g: any) => g.subgenres)

  const toggleSubgenre = (id: string) => {
    if (selectedSubgenres.includes(id)) {
      setSelectedSubgenres((prev: string[]) =>
        prev.filter(s => s !== id)
      )
    } else {
      if (selectedSubgenres.length >= maxSubgenres) return
      setSelectedSubgenres((prev: string[]) => [...prev, id])
    }
  }

  if (selectedGenres.length === 0) return null

  return (
    <div className="mb-6">

      <h2 className="mb-2 font-semibold">
        Subgéneros (máx {maxSubgenres})
      </h2>

      <div className="flex flex-wrap gap-2">

        {availableSubgenres.map((s: any) => (
          <button
            key={s.id}
            onClick={() => toggleSubgenre(s.id)}
            className={`px-3 py-1 rounded-full text-sm transition
              ${selectedSubgenres.includes(s.id)
                ? "bg-blue-400 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}
            `}
          >
            {s.label}
          </button>
        ))}

      </div>

    </div>
  )
}