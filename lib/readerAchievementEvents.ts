export const READER_ACHIEVEMENTS_CHANGED_EVENT = "reader-achievements-changed"

export function notifyReaderAchievementsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(READER_ACHIEVEMENTS_CHANGED_EVENT))
  }
}
