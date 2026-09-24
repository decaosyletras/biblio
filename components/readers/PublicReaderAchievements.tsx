"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Trophy } from "lucide-react"
import AchievementIcon from "@/components/readers/AchievementIcon"
import type { ReaderAchievementStatus } from "@/lib/readerAchievementCatalog"

export default function PublicReaderAchievements({
  achievements,
}: {
  achievements: ReaderAchievementStatus[]
}) {
  const [showAll, setShowAll] = useState(false)

  if (achievements.length === 0) return null

  const hasMoreAchievements = achievements.length > 3
  const visibleAchievements = showAll
    ? achievements
    : achievements.slice(0, 3)

  return (
    <section className="mt-8 rounded-[2rem] border border-amber-400/15 bg-gradient-to-br from-zinc-900/80 to-amber-950/20 p-6 sm:p-9">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
          <Trophy aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Logros lectores</h2>
          <p className="text-sm text-zinc-500">Una muestra de su recorrido indie</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {visibleAchievements.map((achievement) => (
          <article
            key={achievement.key}
            className="flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-zinc-950/45 p-4"
          >
            <span className="shrink-0 rounded-xl bg-amber-400/10 p-2.5 text-amber-300">
              <AchievementIcon icon={achievement.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-snug text-zinc-100">
                {achievement.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                {achievement.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {hasMoreAchievements && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/10"
          >
            {showAll ? (
              <ChevronUp size={17} aria-hidden="true" />
            ) : (
              <ChevronDown size={17} aria-hidden="true" />
            )}
            {showAll
              ? "Mostrar menos"
              : `Ver todos los logros (${achievements.length})`}
          </button>
        </div>
      )}
    </section>
  )
}
