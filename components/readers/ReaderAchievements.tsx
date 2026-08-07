"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronDown, Sparkles, Trophy } from "lucide-react"
import AchievementIcon from "@/components/readers/AchievementIcon"
import type {
  ReaderAchievementKey,
  ReaderAchievementStatus,
} from "@/lib/readerAchievementCatalog"
import { READER_ACHIEVEMENTS_CHANGED_EVENT } from "@/lib/readerAchievementEvents"

type AchievementResponse = {
  achievements?: ReaderAchievementStatus[]
  newlyUnlockedKeys?: ReaderAchievementKey[]
  error?: string
}

export default function ReaderAchievements() {
  const [achievements, setAchievements] = useState<ReaderAchievementStatus[]>([])
  const [newlyUnlockedKeys, setNewlyUnlockedKeys] = useState<
    ReaderAchievementKey[]
  >([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadAchievements = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/readers/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
      })
      const result = (await response.json()) as AchievementResponse

      if (!response.ok) {
        setError(result.error ?? "No se pudieron cargar tus logros")
        return
      }

      const unlocked = result.newlyUnlockedKeys ?? []
      setAchievements(result.achievements ?? [])
      setNewlyUnlockedKeys(unlocked)
      if (unlocked.length > 0) setIsOpen(true)
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return
      }

      setError("No se pudieron cargar tus logros")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    function handleAchievementsChanged() {
      void loadAchievements()
    }

    void loadAchievements(controller.signal)
    window.addEventListener(
      READER_ACHIEVEMENTS_CHANGED_EVENT,
      handleAchievementsChanged
    )

    return () => {
      controller.abort()
      window.removeEventListener(
        READER_ACHIEVEMENTS_CHANGED_EVENT,
        handleAchievementsChanged
      )
    }
  }, [loadAchievements])

  const activeCount = achievements.filter(
    (achievement) => achievement.isActive
  ).length
  const newTitles = useMemo(() => {
    const keys = new Set(newlyUnlockedKeys)

    return achievements
      .filter((achievement) => keys.has(achievement.key))
      .map((achievement) => achievement.title)
  }, [achievements, newlyUnlockedKeys])

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-400">
        {error}. Tu biblioteca sigue funcionando con normalidad.
      </section>
    )
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20">
      {newTitles.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 border-b border-amber-400/20 bg-amber-400/10 px-5 py-4 text-amber-100"
        >
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">
              {newTitles.length === 1 ? "¡Nuevo logro!" : "¡Nuevos logros!"}
            </p>
            <p className="mt-0.5 text-sm text-amber-200/80">
              {newTitles.join(" · ")}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white/[0.025] sm:px-6"
      >
        <span className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
          <Trophy className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-zinc-100">Mis logros</span>
          <span className="mt-1 block text-sm text-zinc-400">
            {loading
              ? "Calculando tu recorrido lector..."
              : `${activeCount} de ${achievements.length} desbloqueados`}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-zinc-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && !loading && (
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">
          {achievements.map((achievement) => {
            const progress = Math.min(achievement.current, achievement.target)

            return (
              <article
                key={achievement.key}
                className={`flex min-w-0 flex-col rounded-2xl border p-4 ${
                  achievement.isActive
                    ? "border-amber-400/25 bg-amber-400/[0.07]"
                    : "border-zinc-800 bg-zinc-950/50 opacity-60 grayscale"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-xl p-2 ${
                      achievement.isActive
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <AchievementIcon icon={achievement.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {achievement.mode === "permanent" ? "Permanente" : "Activo"}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-zinc-100">
                  {achievement.title}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-400">
                  {achievement.description}
                </p>
                {!achievement.isActive && (
                  <p className="mt-3 text-xs font-medium text-zinc-500">
                    {progress}/{achievement.target}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
