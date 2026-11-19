"use client"

import { useEffect, useState } from "react"
import { SceneCard } from "@/components/game/theme"
import { Sprite } from "@/components/game/sprite"
import {
  GameLayout,
  Hud,
  ResultCard,
  StartCard,
  TaskProgress,
  tileClass,
  useGameSession,
} from "@/components/game/game-ui"
import { pickIngredients, type Item } from "@/lib/game/items"

const SHEET = "ingredients1"
const SECONDS = 45
const GRID = 12
const WRONG_PENALTY = 5
// after a wrong tap the grid locks for a moment, so spamming taps doesn't work
const WRONG_LOCK_MS = 450
// once your streak hits this, you only get the name (worth double)
const NAME_STREAK = 5

const xpFor = (score: number) => Math.round(score / 50)

export default function QuickPickPage() {
  const game = useGameSession({ id: "quick-pick", seconds: SECONDS })
  const [options, setOptions] = useState<Item[]>([])
  const [target, setTarget] = useState<Item | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [found, setFound] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)

  const nameRound = streak >= NAME_STREAK

  function deal() {
    // only the named ingredients, since some frames in the sheet look almost the same
    const items = pickIngredients(GRID)
    setOptions(items)
    setTarget(items[Math.floor(Math.random() * items.length)])
    setWrong(null)
  }

  function begin() {
    setStreak(0)
    setBestStreak(0)
    setFound(0)
    deal()
    game.start()
  }

  function choose(item: Item) {
    if (game.phase !== "playing" || wrong !== null || !target) return
    if (item.frame === target.frame) {
      // streaks add a bonus, and name rounds count double
      const bonus = Math.min(streak, 5) * 5
      game.setScore((s) => s + (10 + bonus) * (nameRound ? 2 : 1))
      setStreak(streak + 1)
      setBestStreak(Math.max(bestStreak, streak + 1))
      setFound((n) => n + 1)
      deal()
    } else {
      setStreak(0)
      game.setScore((s) => Math.max(0, s - WRONG_PENALTY))
      setWrong(item.frame)
      setTimeout(() => setWrong(null), WRONG_LOCK_MS)
    }
  }

  // game ends when the timer hits 0
  useEffect(() => {
    if (game.phase === "playing" && game.timeLeft === 0) {
      game.finish(xpFor(game.score))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.timeLeft, game.phase])

  return (
    <GameLayout
      title="Quick Pick"
      game="quick-pick"
      scene="fridge"
      blurb="Find the ingredient before time runs out."
      hud={
        game.phase === "playing"
          ? (
            <Hud
              items={[
                { label: "Time", value: `${game.timeLeft}s` },
                { label: "Score", value: game.score },
                { label: "Streak", value: `×${streak}` },
              ]}
            />
          )
          : undefined
      }
    >
      {game.phase === "idle" && (
        <StartCard
          howTo={`Find each ingredient in the grid as fast as you can. Get ${NAME_STREAK} in a row and you'll only see the name, which is worth double. Wrong taps cost points and reset your streak. You've got ${SECONDS} seconds.`}
          onStart={begin}
          countdown
          hero={[
            { sheet: SHEET, frame: 86 },
            { sheet: SHEET, frame: 50 },
            { sheet: SHEET, frame: 36 },
          ]}
        />
      )}

      {game.phase === "playing" && target !== null && (
        <div className="space-y-6">
          <TaskProgress label="Time used" done={SECONDS - game.timeLeft} total={SECONDS} unit="sec" />
          <SceneCard
            soft
            className={nameRound ? "ring-2 ring-amber-400/80" : ""}
            contentClassName="flex items-center justify-center gap-5 py-6"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Find {nameRound ? "the" : "this"}
            </span>
            {/* key changes with every new target so it pops in */}
            <div key={target.frame} className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-90 duration-200">
              {nameRound ? (
                <>
                  <span className="text-3xl font-black tracking-tight">{target.name}</span>
                  <span className="rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 shadow-sm dark:from-amber-900/70 dark:to-amber-900/40 dark:text-amber-200">
                    Name round! Double points
                  </span>
                </>
              ) : (
                <>
                  <Sprite sheet={SHEET} index={target.frame} size={76} title={target.name} className="drop-shadow-lg" />
                  <span className="text-xs font-semibold text-muted-foreground">{target.name}</span>
                </>
              )}
            </div>
          </SceneCard>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
            {options.map((item) => (
              <button
                key={item.frame}
                onClick={() => choose(item)}
                aria-label={item.name}
                className={`${tileClass(wrong === item.frame ? "wrong" : "idle")} aspect-square`}
              >
                <Sprite sheet={SHEET} index={item.frame} size={64} />
              </button>
            ))}
          </div>
        </div>
      )}

      {game.phase === "done" && (
        <ResultCard
          headline={`${game.score} points`}
          detail={`You found ${found} ingredient${found === 1 ? "" : "s"}. Best streak: ${bestStreak}.`}
          xp={game.xp}
          newBest={game.newBest}
          stars={game.stars}
          onReplay={begin}
        />
      )}
    </GameLayout>
  )
}
