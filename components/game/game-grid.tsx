"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprite } from "@/components/game/sprite"
import { Stars } from "@/components/game/game-ui"
import { GAME_ICON, readProgress, starsFor, type GameId, type ProgressMap } from "@/lib/game/progress"

type Entry = {
  id: GameId
  href: string
  name: string
  blurb: string
  /** gradient behind the icon so each game is easy to spot */
  tile: string
}

// two groups: games that teach real cooking, and quick reflex/memory games
const SECTIONS: { title: string; note: string; games: Entry[] }[] = [
  {
    title: "Kitchen skills",
    note: "Learn the real thing",
    games: [
      {
        id: "fill-the-pot",
        href: "/games/fill-the-pot",
        name: "Fill the Pot",
        blurb: "Remember the recipe and cook it.",
        tile: "from-violet-100 to-violet-50 dark:from-violet-950/70 dark:to-neutral-900",
      },
      {
        id: "prep-station",
        href: "/games/prep-station",
        name: "Prep Station",
        blurb: "Grab the right tool for each ingredient.",
        tile: "from-sky-100 to-sky-50 dark:from-sky-950/70 dark:to-neutral-900",
      },
      {
        id: "dont-burn-it",
        href: "/games/dont-burn-it",
        name: "Don't Burn It",
        blurb: "Take it off the heat at just the right time.",
        tile: "from-emerald-100 to-emerald-50 dark:from-emerald-950/70 dark:to-neutral-900",
      },
    ],
  },
  {
    title: "Quick challenges",
    note: "Beat the clock",
    games: [
      {
        id: "quick-pick",
        href: "/games/quick-pick",
        name: "Quick Pick",
        blurb: "Find the ingredient before time runs out.",
        tile: "from-amber-100 to-amber-50 dark:from-amber-950/70 dark:to-neutral-900",
      },
      {
        id: "memory-match",
        href: "/games/memory-match",
        name: "Memory Match",
        blurb: "Match each ingredient with its name.",
        tile: "from-rose-100 to-rose-50 dark:from-rose-950/70 dark:to-neutral-900",
      },
    ],
  },
]

export function GameGrid() {
  const [progress, setProgress] = useState<ProgressMap>({})

  useEffect(() => {
    const refresh = () => setProgress(readProgress())
    refresh()
    window.addEventListener("cookmama:progress", refresh)
    return () => window.removeEventListener("cookmama:progress", refresh)
  }, [])

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <div className="mb-4 flex items-baseline gap-3 border-b pb-2">
            <h2 className="font-bold">{section.title}</h2>
            <span className="text-sm text-muted-foreground">{section.note}</span>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {section.games.length} games
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.games.map((g) => {
              const record = progress[g.id]
              const icon = GAME_ICON[g.id]
              return (
                <Link key={g.id} href={g.href} className="group">
                  <Card className="h-full rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg dark:hover:border-rose-800">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner ${g.tile}`}
                      >
                        <Sprite
                          sheet={icon.sheet}
                          index={icon.frame}
                          size={60}
                          className="transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold leading-tight">{g.name}</h3>
                          {record ? (
                            <Stars count={starsFor(g.id, record.best)} size="h-4 w-4" />
                          ) : (
                            <Badge className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-500">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-snug text-muted-foreground">{g.blurb}</p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {record ? `Best ${record.best}, played ${record.plays} ${record.plays === 1 ? "time" : "times"}` : ""}
                          </span>
                          <span className="inline-flex shrink-0 items-center rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-rose-600">
                            Play →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
