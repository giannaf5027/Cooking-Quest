"use client"

// per game progress saved in localStorage (how many times each game was played and the best score).
// it's separate from account XP on purpose: XP lives on the server, this works even when
// signed out and doesn't need a db change

export const GAME_IDS = ["memory-match", "quick-pick", "dont-burn-it", "prep-station", "fill-the-pot"] as const
export type GameId = (typeof GAME_IDS)[number]

// the sprite used for each game on the hub cards and in its header
export const GAME_ICON: Record<GameId, { sheet: string; frame: number }> = {
  "fill-the-pot": { sheet: "cookware1", frame: 54 },
  "prep-station": { sheet: "cookware2", frame: 8 },
  "dont-burn-it": { sheet: "cookware1", frame: 31 },
  "quick-pick": { sheet: "ingredients1", frame: 86 },
  "memory-match": { sheet: "ingredients1", frame: 7 },
}

export type GameRecord = { plays: number; best: number; lastXp: number }
export type ProgressMap = Partial<Record<GameId, GameRecord>>

const KEY = "cookmama_minigames"

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as ProgressMap
  } catch {
    return {}
  }
}

export function recordResult(id: GameId, score: number, xp: number): ProgressMap {
  const all = readProgress()
  const prev = all[id] ?? { plays: 0, best: 0, lastXp: 0 }
  all[id] = { plays: prev.plays + 1, best: Math.max(prev.best, score), lastXp: xp }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all))
    // tell any progress bars on the page to update
    window.dispatchEvent(new CustomEvent("cookmama:progress"))
  } catch {
    // storage is blocked (private mode), the round still counts for this visit
  }
  return all
}

// score needed for 1, 2 and 3 stars in each game. a decent first try should get 1 or 2,
// 3 needs a really clean run
export const STAR_SCORES: Record<GameId, [number, number, number]> = {
  "memory-match": [400, 560, 680], // 800 max, every move past 8 costs 15
  "quick-pick": [300, 700, 1100], // points in 45 seconds
  "dont-burn-it": [250, 450, 650], // 100 per perfect dish, plus streak bonuses
  "prep-station": [300, 550, 750], // 100 per right tool, plus up to 50 for speed
  "fill-the-pot": [300, 600, 850],
}

export function starsFor(id: GameId, score: number) {
  return STAR_SCORES[id].filter((needed) => score >= needed).length
}

// how many games have been played at least once
export function completionOf(all: ProgressMap) {
  const done = GAME_IDS.filter((id) => (all[id]?.plays ?? 0) > 0).length
  return { done, total: GAME_IDS.length, percent: Math.round((done / GAME_IDS.length) * 100) }
}
