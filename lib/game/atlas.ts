import atlasJson from "@/public/game/atlas.json"

export type Frame = [x: number, y: number, w: number, h: number]

export type SheetKey = keyof typeof atlasJson

type Sheet = { src: string; w: number; h: number; frames: Frame[] }

// frame rectangles for every sprite sheet, made by scripts/slice_sprites.py.
// the sheets stay whole and get drawn with background-position, so we ship a few dozen
// images instead of ~1300 separate sprites
export const atlas = atlasJson as unknown as Record<string, Sheet>

export type Theme = "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "black"

export const THEMES: Theme[] = ["blue", "green", "orange", "purple", "red", "yellow", "pink", "black"]

// kitchen scenes cut out of each theme's background.png by scripts/slice_sprites.py
export type Scene = "board" | "bowl" | "pot" | "skillet" | "oven" | "plate" | "sink" | "fridge" | "pantry"

export function scenePath(theme: Theme, scene: Scene) {
  return `/game/${theme}/scenes/${scene}.webp`
}

// sheet keys can leave off the color ("ingredients1") and they'll use the player's theme.
// keys that already have a prefix ("blue/...") are left alone
export function themedKey(key: string, theme: Theme) {
  return key.includes("/") ? key : `${theme}/${key}`
}

export function sheet(key: string): Sheet {
  const s = atlas[key]
  if (!s) throw new Error(`Unknown sprite sheet: ${key}`)
  return s
}

export function frameCount(key: string) {
  return sheet(key).frames.length
}

// shuffle that can take a seeded random function, handy for replaying a round when debugging
export function shuffle<T>(items: T[], rand: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// pick n different frame numbers from a sheet
export function pickFrames(key: string, n: number): number[] {
  const total = frameCount(key)
  return shuffle([...Array(total).keys()]).slice(0, Math.min(n, total))
}
