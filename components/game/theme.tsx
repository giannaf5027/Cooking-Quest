"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { THEMES, scenePath, type Scene, type Theme } from "@/lib/game/atlas"
import { DEFAULT_THEME, THEME_EVENT, THEME_SWATCH, readTheme, saveTheme } from "@/lib/game/theme"

type ThemeState = {
  theme: Theme
  /** false until we've read the saved theme, so we don't load the wrong color art first */
  ready: boolean
  setTheme: (theme: Theme) => void
}

const GameThemeContext = createContext<ThemeState>({ theme: DEFAULT_THEME, ready: true, setTheme: () => {} })

// keeps the chosen theme for everything under /games (see app/games/layout.tsx),
// so switching between games doesn't reset it
export function GameThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setThemeState(readTheme())
      setReady(true)
    }
    refresh()
    window.addEventListener(THEME_EVENT, refresh)
    window.addEventListener("storage", refresh) // other tabs
    return () => {
      window.removeEventListener(THEME_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    saveTheme(next)
  }, [])

  return <GameThemeContext.Provider value={{ theme, ready, setTheme }}>{children}</GameThemeContext.Provider>
}

export function useGameTheme() {
  return useContext(GameThemeContext)
}

// the row of color dots for picking a kitchen theme
export function ThemePicker({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useGameTheme()
  return (
    <div role="radiogroup" aria-label="Kitchen theme" className={`flex items-center gap-1.5 ${className}`}>
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={t === theme}
          aria-label={`${t} kitchen`}
          title={`${t[0].toUpperCase()}${t.slice(1)} kitchen`}
          onClick={() => setTheme(t)}
          className={`h-6 w-6 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
            t === theme ? "scale-110 border-foreground" : "border-white dark:border-neutral-700"
          }`}
          style={{ backgroundColor: THEME_SWATCH[t] }}
        />
      ))}
    </div>
  )
}

// loads scenes a game will switch to later, so the background doesn't pop in
export function preloadScenes(theme: Theme, scenes: Iterable<Scene>) {
  for (const scene of new Set(scenes)) {
    new Image().src = scenePath(theme, scene)
  }
}

// which kitchen scene a game uses. GameLayout sets it and SceneCard reads it
export const GameSceneContext = createContext<Scene | null>(null)

// a card drawn on top of the game's kitchen scene (in the player's theme).
// the white wash over the scene keeps the sprites and text easy to read
export function SceneCard({
  scene,
  soft = false,
  className = "",
  contentClassName = "",
  children,
}: {
  /** defaults to the scene from GameLayout */
  scene?: Scene
  /** blur the scene. use this on cards with a sprite in the middle so it doesn't sit on top of the scene's own pot or oven */
  soft?: boolean
  className?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  const { theme, ready } = useGameTheme()
  const layoutScene = useContext(GameSceneContext)
  const shown = scene ?? layoutScene

  return (
    <Card className={`relative overflow-hidden rounded-2xl shadow-md ${className}`}>
      {shown && ready && (
        <>
          <div
            aria-hidden
            className={`absolute inset-0 bg-cover bg-center ${soft ? "scale-110 blur-[3px]" : ""}`}
            style={{ backgroundImage: `url(${scenePath(theme, shown)})` }}
          />
          <div
            aria-hidden
            className={`absolute inset-0 ${soft ? "bg-white/70 dark:bg-neutral-950/70" : "bg-white/60 dark:bg-neutral-950/65"}`}
          />
          {/* soft spotlight in the middle so the main picture stands out */}
          {soft && (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.75)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.09)_0%,transparent_60%)]"
            />
          )}
        </>
      )}
      <CardContent className={`relative ${contentClassName}`}>{children}</CardContent>
    </Card>
  )
}

// used on the start and results screens: the whole scene shows at the top (so you can see
// the pot, oven, fridge...), its bottom fades into the card, and the content slides up
// into the fade a moment later
export function SceneHero({
  scene,
  className = "",
  children,
}: {
  /** defaults to the scene from GameLayout */
  scene?: Scene
  className?: string
  children: React.ReactNode
}) {
  const { theme, ready } = useGameTheme()
  const layoutScene = useContext(GameSceneContext)
  const shown = scene ?? layoutScene

  return (
    <Card className={`relative overflow-hidden rounded-2xl shadow-md ${className}`}>
      {shown && (
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]">
          {ready && (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center animate-in fade-in zoom-in-105 duration-700"
              style={{ backgroundImage: `url(${scenePath(theme, shown)})` }}
            />
          )}
          {/* fade the bottom of the scene into the card */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-card" />
        </div>
      )}
      <div
        className={`relative flex justify-center px-4 pb-8 animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-500 ${
          shown ? "-mt-12 sm:-mt-16" : "pt-8"
        }`}
        style={{ animationDelay: "350ms" }}
      >
        {children}
      </div>
    </Card>
  )
}
