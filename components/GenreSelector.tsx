"use client"

export default function GenreSelector({
  genresCatalog,
  selectedGenres,
  setSelectedGenres
}: any) {

  const toggleGenre = (id: string) => {
    if (selectedGenres.includes(id)) {
      setSelectedGenres((prev: string[]) =>
        prev.filter(g => g !== id)
      )
    } else {
      if (selectedGenres.length >= 4) return
      setSelectedGenres((prev: string[]) => [...prev, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">

      <h2 className="mb-2 font-semibold">
        Géneros (máx 4)
      </h2>

      {genresCatalog.map((g: any) => (
        <button
        key={g.id}
        onClick={() => toggleGenre(g.id)}
        className={`px-4 py-2 rounded-full text-sm transition
          ${selectedGenres.includes(g.id)
            ? "bg-yellow-400 text-black"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}
        `}
      >
        {g.label}
      </button>
      ))}

    </div>
  )
}