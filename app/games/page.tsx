import type { Metadata } from "next"
import { Gamepad2 } from "lucide-react"
import { GameGrid } from "@/components/game/game-grid"
import { MinigameProgress } from "@/components/game/progress-bar"
import { SceneCard, ThemePicker } from "@/components/game/theme"

export const metadata: Metadata = {
  title: "Games | CookMama",
  description: "Quick kitchen games that earn XP.",
}

export default function GamesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* banner over the pantry scene, in whatever kitchen color the player picked */}
      <SceneCard scene="pantry" className="mb-10" contentClassName="p-4 sm:p-8">
        <div className="flex flex-col gap-5 rounded-2xl bg-white/85 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between dark:bg-neutral-950/80 dark:ring-white/10">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
              <Gamepad2 className="h-8 w-8 text-rose-500" />
              Games
            </h1>
            <p className="text-muted-foreground">Quick cooking games. Finish a round to earn XP.</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <MinigameProgress compact />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kitchen</span>
              <ThemePicker />
            </div>
          </div>
        </div>
      </SceneCard>

      <GameGrid />
    </div>
  )
}
