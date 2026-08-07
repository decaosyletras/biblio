import { Trophy } from "lucide-react"
import AchievementIcon from "@/components/readers/AchievementIcon"
import type { ReaderAchievementStatus } from "@/lib/readerAchievementCatalog"

export default function PublicReaderAchievements({
  achievements,
}: {
  achievements: ReaderAchievementStatus[]
}) {
  if (achievements.length === 0) return null

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
        {achievements.map((achievement) => (
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
    </section>
  )
}
