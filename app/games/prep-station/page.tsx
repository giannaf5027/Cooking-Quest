"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SceneCard, preloadScenes, useGameTheme } from "@/components/game/theme"
import { Sprite } from "@/components/game/sprite"
import {
  GameLayout,
  Hud,
  ResultCard,
  StartCard,
  TaskProgress,
  primaryButton,
  tileClass,
  useGameSession,
} from "@/components/game/game-ui"
import { shuffle } from "@/lib/game/atlas"
import { ALL_TOOLS, PREP_TASKS, type Item, type PrepTask } from "@/lib/game/items"

const ROUNDS = 6
const CHOICES = 4
const ING_SHEET = "ingredients1"
const TOOL_SHEET = "cookware2"
// 10 seconds per ingredient, answering faster gets a bonus
const ROUND_MS = 10_000
const TICK_MS = 100
const MAX_SPEED_BONUS = 50
// goes in `picked` when time runs out, so no tool counts as chosen
const TIMED_OUT = -1

const xpFor = (score: number) => Math.round(score / 30)

export default function PrepStationPage() {
  const game = useGameSession({ id: "prep-station" })
  const { theme } = useGameTheme()
  const [queue, setQueue] = useState<PrepTask[]>([])
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState<Item[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [msLeft, setMsLeft] = useState(ROUND_MS)
  const [lastPoints, setLastPoints] = useState(0)
  const [matched, setMatched] = useState(0)

  const task = queue[round]

  function dealChoices(forTask: PrepTask) {
    const wrong = shuffle(ALL_TOOLS.filter((t) => t.frame !== forTask.tool.frame)).slice(0, CHOICES - 1)
    setChoices(shuffle([forTask.tool, ...wrong]))
    setPicked(null)
    setMsLeft(ROUND_MS)
  }

  function begin() {
    const q = shuffle(PREP_TASKS).slice(0, ROUNDS)
    preloadScenes(theme, q.map((t) => t.scene))
    setQueue(q)
    setRound(0)
    setMatched(0)
    dealChoices(q[0])
    game.start()
  }

  function pick(frame: number) {
    if (picked !== null || !task) return
    setPicked(frame)
    if (frame === task.tool.frame) {
      // 100 points plus up to 50 more for answering fast
      const points = 100 + Math.round((MAX_SPEED_BONUS * msLeft) / ROUND_MS)
      game.setScore((s) => s + points)
      setMatched((m) => m + 1)
      setLastPoints(points)
    } else {
      setLastPoints(0)
    }
  }

  function next() {
    if (round === queue.length - 1) {
      game.finish(xpFor(game.score))
      return
    }
    const n = round + 1
    setRound(n)
    dealChoices(queue[n])
  }

  // count down while the player hasn't answered yet
  useEffect(() => {
    if (game.phase !== "playing" || picked !== null) return
    const id = setInterval(() => setMsLeft((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearInterval(id)
  }, [game.phase, picked, round])

  // running out of time counts as a miss, but still shows the right tool
  useEffect(() => {
    if (game.phase === "playing" && picked === null && msLeft === 0) {
      setPicked(TIMED_OUT)
      setLastPoints(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msLeft])

  // keys 1-4 pick a tool, Enter or Space goes to the next one
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (game.phase !== "playing" || !task) return
      const n = Number(e.key)
      if (picked === null && n >= 1 && n <= choices.length) {
        pick(choices[n - 1].frame)
      } else if (picked !== null && (e.key === "Enter" || e.code === "Space")) {
        // if a button has focus it already handles Enter/Space on its own
        if (e.target instanceof HTMLButtonElement && !e.target.disabled) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const correct = picked !== null && task && picked === task.tool.frame
  const timeLow = msLeft < 3000

  return (
    <GameLayout
      title="Prep Station"
      game="prep-station"
      scene="board"
      blurb="Grab the right tool for each ingredient."
      hud={
        game.phase === "playing"
          ? <Hud items={[{ label: "Prep", value: `${round + 1}/${queue.length}` }, { label: "Score", value: game.score }]} />
          : undefined
      }
    >
      {game.phase === "idle" && (
        <StartCard
          howTo="You'll get an ingredient. Pick the tool a real cook would use for it, like a peeler, a grater, a whisk or the right knife. You have 10 seconds for each one and faster answers get bonus points. You can also use the 1-4 keys."
          onStart={begin}
          countdown
          hero={[
            { sheet: ING_SHEET, frame: 23 },
            { sheet: TOOL_SHEET, frame: 12 },
            { sheet: ING_SHEET, frame: 12 },
          ]}
        />
      )}

      {game.phase === "playing" && task && (
        <div className="space-y-6">
          <TaskProgress
            label="Prep list"
            done={round + (picked !== null ? 1 : 0)}
            total={queue.length}
            unit="done"
          />
          <SceneCard soft scene={task.scene} contentClassName="flex flex-col items-center gap-3 py-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How would you prep this?</p>
            <div key={round} className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-90 duration-200">
              <Sprite sheet={ING_SHEET} index={task.ingredient.frame} size={96} title={task.ingredient.name} className="drop-shadow-xl" />
              <p className="text-xl font-black tracking-tight">{task.ingredient.name}</p>
            </div>
            {/* time left for this ingredient */}
            <div
              className="h-2 w-52 overflow-hidden rounded-full bg-black/10 shadow-inner dark:bg-white/20"
              role="progressbar"
              aria-label="Time left"
              aria-valuenow={Math.ceil(msLeft / 1000)}
              aria-valuemin={0}
              aria-valuemax={ROUND_MS / 1000}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-100 ease-linear ${
                  timeLow ? "from-rose-500 to-pink-500" : "from-amber-300 to-amber-500"
                }`}
                style={{ width: `${(msLeft / ROUND_MS) * 100}%` }}
              />
            </div>
          </SceneCard>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {choices.map((tool, i) => {
              const isAnswer = tool.frame === task.tool.frame
              const look =
                picked === null
                  ? tileClass("idle")
                  : isAnswer
                    ? tileClass("right")
                    : picked === tool.frame
                      ? tileClass("wrong")
                      : tileClass("faded")
              return (
                <button key={tool.frame} onClick={() => pick(tool.frame)} disabled={picked !== null} className={look}>
                  <span className="absolute left-2 top-1.5 hidden text-xs font-semibold text-muted-foreground sm:block">
                    {i + 1}
                  </span>
                  <Sprite sheet={TOOL_SHEET} index={tool.frame} size={56} />
                  <span className="text-xs font-semibold">{tool.name}</span>
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <Card
              className={`rounded-2xl border-2 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                correct
                  ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/40"
                  : "border-rose-200 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/40"
              }`}
            >
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <p className={`text-xl font-black ${correct ? "text-emerald-600" : "text-rose-600"}`}>
                  {correct
                    ? `Right tool! +${lastPoints}`
                    : picked === TIMED_OUT
                      ? `Out of time. You needed the ${task.tool.name.toLowerCase()}.`
                      : `Not quite. You needed the ${task.tool.name.toLowerCase()}.`}
                </p>
                {correct && lastPoints > 100 && (
                  <p className="-mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                    includes +{lastPoints - 100} for being quick
                  </p>
                )}
                <p className="max-w-md text-sm text-muted-foreground">{task.why}</p>
                <Button onClick={next} className={primaryButton}>
                  {round === queue.length - 1 ? "See results" : "Next ingredient"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {game.phase === "done" && (
        <ResultCard
          headline={`${game.score} points`}
          detail={`${matched} of ${queue.length} tools matched.`}
          xp={game.xp}
          newBest={game.newBest}
          stars={game.stars}
          onReplay={begin}
        />
      )}
    </GameLayout>
  )
}
