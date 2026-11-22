"use client"

// which color of Gianna's art the games use (sprite sheets and kitchen backgrounds).
// saved in localStorage like the game progress, so it works signed out and needs no db change

import { THEMES, type Theme } from "@/lib/game/atlas"

export const DEFAULT_THEME: Theme = "blue"

// color of each dot in the theme picker
export const THEME_SWATCH: Record<Theme, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  red: "#ef4444",
  yellow: "#eab308",
  pink: "#ec4899",
  black: "#3f3f46",
}

const KEY = "cookmama_game_theme"
export const THEME_EVENT = "cookmama:game-theme"

export function readTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const saved = window.localStorage.getItem(KEY) as Theme | null
    return saved && THEMES.includes(saved) ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    // storage blocked (private mode), the choice still works for this visit
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT))
}
