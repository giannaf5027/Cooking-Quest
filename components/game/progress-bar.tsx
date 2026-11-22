"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { completionOf, readProgress, type ProgressMap } from "@/lib/game/progress"

// overall minigame progress. reads localStorage on load and listens for the event
// that fires when a round finishes, so the bar updates without a reload
export function MinigameProgress({ compact = false }: { compact?: boolean }) {
  const [progress, setProgress] = useState<ProgressMap | null>(null)

  useEffect(() => {
    const refresh = () => setProgress(readProgress())
    refresh()
    window.addEventListener("cookmama:progress", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("cookmama:progress", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  // render nothing until mounted so the server and client html match
  if (!progress) return null

  const { done, total, percent } = completionOf(progress)

  if (compact) {
    return (
      <div className="w-44">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Games played</span>
          <span className="text-xs font-semibold tabular-nums">{done}/{total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-rose-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-white dark:border-rose-900/20 dark:from-rose-950/20 dark:to-background">
      <CardContent className="py-5">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="font-medium">Games played</p>
          <p className="text-sm text-muted-foreground tabular-nums">{done} of {total}</p>
        </div>
        <Progress value={percent} className="h-2.5 bg-rose-100 dark:bg-rose-900/20">
          <div className="h-full bg-rose-500 transition-all" style={{ width: `${percent}%` }} />
        </Progress>
        <p className="mt-2 text-sm text-muted-foreground">
          {done === total
            ? "You've played them all. Now go beat your best scores!"
            : `${total - done} more to try.`}
        </p>
      </CardContent>
    </Card>
  )
}
