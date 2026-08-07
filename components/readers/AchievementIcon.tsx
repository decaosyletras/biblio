import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Bookmark,
  CalendarDays,
  Compass,
  Heart,
  ImageIcon,
  LibraryBig,
  Map,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import type { ReaderAchievementIcon } from "@/lib/readerAchievementCatalog"

const ICONS: Record<ReaderAchievementIcon, LucideIcon> = {
  badge: BadgeCheck,
  book: BookOpenCheck,
  bookmark: Bookmark,
  calendar: CalendarDays,
  compass: Compass,
  heart: Heart,
  image: ImageIcon,
  library: LibraryBig,
  map: Map,
  medal: Award,
  sparkles: Sparkles,
  users: UsersRound,
}

export default function AchievementIcon({
  icon,
  className,
}: {
  icon: ReaderAchievementIcon
  className?: string
}) {
  const Icon = ICONS[icon]

  return <Icon className={className} aria-hidden="true" />
}
