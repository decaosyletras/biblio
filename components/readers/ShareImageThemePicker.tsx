"use client"

import {
  SHARE_IMAGE_THEMES,
  type ShareImageTheme,
} from "@/lib/shareImageThemes"

type Props = {
  value: ShareImageTheme
  onChange: (theme: ShareImageTheme) => void
  name: string
}

export default function ShareImageThemePicker({
  value,
  onChange,
  name,
}: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-zinc-400">Tema</legend>
      <div className="grid grid-cols-4 gap-2">
        {SHARE_IMAGE_THEMES.map((theme) => (
          <label
            key={theme.value}
            className={`flex cursor-pointer flex-col items-center rounded-xl border px-2 py-2 transition ${
              value === theme.value
                ? "border-yellow-400/60 bg-yellow-400/10"
                : "border-zinc-700 bg-zinc-950/40 hover:border-zinc-600"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={theme.value}
              checked={value === theme.value}
              onChange={() => onChange(theme.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: theme.swatch }}
            />
            <span className="mt-1.5 text-[10px] font-medium text-zinc-300 sm:text-xs">
              {theme.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
