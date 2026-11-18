"use client"

import { useGameTheme } from "@/components/game/theme"
import { sheet, themedKey } from "@/lib/game/atlas"

// draws one frame from a sprite sheet, scaled to fit inside `size` px.
// pass a sheet name without a color ("ingredients1") and it uses the player's kitchen theme
// (every theme's sheet has the same frames in the same order).
// the whole sheet is the background image and gets shifted into place, so each theme is one download.
// the art is smooth shaded, not real pixel art, so it scales normally (pixelated rendering makes it look worse)
export function Sprite({
  sheet: key,
  index,
  size = 72,
  className = "",
  title,
}: {
  sheet: string
  index: number
  size?: number
  className?: string
  title?: string
}) {
  const { theme, ready } = useGameTheme()
  const resolved = themedKey(key, theme)
  const s = sheet(resolved)
  const frame = s.frames[index % s.frames.length]
  if (!frame) return null

  const [x, y, w, h] = frame
  const scale = size / Math.max(w, h)

  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      // lets tests check which sprite is showing without digging into React state
      data-sheet={resolved}
      data-frame={index}
      title={title}
      className={`inline-block shrink-0 drop-shadow-sm ${className}`}
      style={{
        width: w * scale,
        height: h * scale,
        // wait for the saved theme so we don't download the default sheet for nothing
        backgroundImage: ready ? `url(${s.src})` : undefined,
        backgroundPosition: `${-x * scale}px ${-y * scale}px`,
        backgroundSize: `${s.w * scale}px ${s.h * scale}px`,
        backgroundRepeat: "no-repeat",
      }}
    />
  )
}
