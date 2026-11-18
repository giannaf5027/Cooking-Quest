"use client"

import { useEffect, useRef, useState } from "react"
import { Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SceneCard } from "@/components/game/theme"
import { Sprite } from "@/components/game/sprite"
import {
  GameLayout,
  Hud,
  ResultCard,
  StartCard,
  TaskProgress,
  primaryButton,
  useGameSession,
} from "@/components/game/game-ui"
import { COOK_SEQUENCES, type CookSequence } from "@/lib/game/sequences"
import { shuffle } from "@/lib/game/atlas"

const ROUNDS = 5
const SHEET = "cookware1"
// each round the food cooks a bit faster
const stepMsForRound = (round: number) => Math.max(380, 900 - round * 110)

type Verdict = {
  label: string
  points: number
  tone: string
  kind: "perfect" | "close" | "miss"
  bonus?: number // extra points for perfects in a row
}

// every perfect in a row is worth 25 more than the last one
const STREAK_BONUS = 25

const xpFor = (score: number) => Math.round(score / 25)

function judge(stoppedAt: number, dish: CookSequence): Verdict {
  // the last frame is the burnt picture, so letting it cook all the way never scores
  if (stoppedAt === dish.frames.length - 1) {
    return { label: "Burnt!", points: 0, tone: "text-rose-600", kind: "miss" }
  }
  const off = Math.abs(stoppedAt - dish.perfect)
  if (off === 0) return { label: "Perfect!", points: 100, tone: "text-emerald-600", kind: "perfect" }
  if (off === 1) {
    return {
      label: stoppedAt < dish.perfect ? "Undercooked" : "A bit dark",
      points: 50,
      tone: "text-amber-600",
      kind: "close",
    }
  }
  return {
    label: stoppedAt < dish.perfect ? "Still raw" : "Burnt!",
    points: 0,
    tone: "text-rose-600",
    kind: "miss",
  }
}

// turns the results into something like "2 perfect, 1 close, 2 burnt or raw"
function summarize(verdicts: Verdict[]) {
  const count = (kind: Verdict["kind"]) => verdicts.filter((v) => v.kind === kind).length
  return [
    [count("perfect"), "perfect"],
    [count("close"), "close"],
    [count("miss"), "burnt or raw"],
  ]
    .filter(([n]) => n)
    .map(([n, label]) => `${n} ${label}`)
    .join(", ")
}

export default function DontBurnItPage() {
  const game = useGameSession({ id: "dont-burn-it" })
  const [queue, setQueue] = useState<CookSequence[]>([])
  const [round, setRound] = useState(0)
  const [step, setStep] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [verdicts, setVerdicts] = useState<Verdict[]>([])
  const [streak, setStreak] = useState(0) // perfects in a row
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const dish = queue[round]

  function stopTimer() {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }

  function begin() {
    setQueue(shuffle(COOK_SEQUENCES).slice(0, ROUNDS))
    setRound(0)
    setStep(0)
    setVerdict(null)
    setVerdicts([])
    setStreak(0)
    game.start()
  }

  // move the food along a stage at a time while it's cooking
  useEffect(() => {
    if (game.phase !== "playing" || !dish || verdict) return
    stopTimer()
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= dish.frames.length - 1) {
          stopTimer()
          return s
        }
        return s + 1
      })
    }, stepMsForRound(round))
    return stopTimer
  }, [game.phase, round, dish, verdict])

  // if it reaches the last frame, it burned
  useEffect(() => {
    if (game.phase !== "playing" || !dish || verdict) return
    if (step === dish.frames.length - 1) settle(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  function settle(at: number) {
    if (!dish || verdict) return
    stopTimer()
    const judged = judge(at, dish)
    // perfects in a row get a growing bonus: +25, then +50, then +75...
    const bonus = judged.kind === "perfect" ? streak * STREAK_BONUS : 0
    const v = { ...judged, points: judged.points + bonus, bonus }
    setStreak(judged.kind === "perfect" ? streak + 1 : 0)
    setVerdict(v)
    setVerdicts((all) => [...all, v])
    game.setScore((s) => s + v.points)
  }

  function next() {
    const isLast = round === queue.length - 1
    if (isLast) {
      game.finish(xpFor(game.score))
      return
    }
    setRound((r) => r + 1)
    setStep(0)
    setVerdict(null)
  }

  // space bar works as Stop / Next too
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return
      // if a button has focus, it already handles space on its own
      if (e.target instanceof HTMLButtonElement && !e.target.disabled) return
      e.preventDefault()
      if (game.phase === "playing" && dish && !verdict) settle(step)
      else if (game.phase === "playing" && verdict) next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <GameLayout
      title="Don't Burn It"
      game="dont-burn-it"
      scene="oven"
      blurb="Take each dish off the heat right when it's done."
      hud={
        game.phase === "playing"
          ? (
            <Hud
              items={[
                { label: "Dish", value: `${round + 1}/${queue.length}` },
                { label: "Streak", value: `×${streak}` },
                { label: "Score", value: game.score },
              ]}
            />
          )
          : undefined
      }
    >
      {game.phase === "idle" && (
        <StartCard
          howTo="Each dish cooks one stage at a time. Hit Stop (or press space) when it looks like the picture. Too early and it's raw, too late and it burns. Get a few perfect in a row for bonus points."
          onStart={begin}
          countdown
          hero={[
            { sheet: SHEET, frame: 28 },
            { sheet: SHEET, frame: 31 },
            { sheet: SHEET, frame: 34 },
          ]}
        />
      )}

      {game.phase === "playing" && dish && (
        <div className="space-y-4">
          <TaskProgress label="Dishes cooked" done={round + (verdict ? 1 : 0)} total={queue.length} />
          <SceneCard soft contentClassName="flex flex-col items-center gap-6 py-12">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{dish.name}</p>
              {/* shows what "done" looks like so you're not just guessing */}
              <div className="flex items-center gap-2 rounded-full bg-white/85 py-1 pl-3 pr-1.5 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:bg-neutral-950/75 dark:ring-white/10">
                <span className="text-muted-foreground">Stop when it looks like</span>
                <Sprite sheet={SHEET} index={dish.frames[dish.perfect]} size={48} title={`${dish.name}, perfectly done`} />
              </div>
            </div>

            <Sprite sheet={SHEET} index={dish.frames[step]} size={190} title={dish.name} className="drop-shadow-xl" />

            {/* rough doneness dots, on purpose not exact so you watch the food instead */}
            <div className="flex gap-1.5">
              {dish.frames.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i <= step ? "bg-gradient-to-r from-rose-400 to-pink-500" : "bg-black/15 dark:bg-white/25"
                  }`}
                />
              ))}
            </div>

            {verdict ? (
              <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-75 duration-200">
                <p className={`text-2xl font-black ${verdict.tone}`}>
                  {verdict.label} <span className="text-lg font-bold text-muted-foreground">+{verdict.points}</span>
                </p>
                {!!verdict.bonus && (
                  <p className="-mt-2 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Flame className="h-3.5 w-3.5" /> {streak} in a row! +{verdict.bonus}
                  </p>
                )}
                <Button onClick={next} className={primaryButton}>
                  {round === queue.length - 1 ? "See results" : "Next dish"}
                </Button>
              </div>
            ) : (
              <Button size="lg" className={`${primaryButton} px-14 text-base`} onClick={() => settle(step)}>
                Stop
              </Button>
            )}
          </SceneCard>
        </div>
      )}

      {game.phase === "done" && (
        <ResultCard
          headline={`${game.score} points`}
          detail={`You cooked ${queue.length} dishes: ${summarize(verdicts)}.`}
          xp={game.xp}
          newBest={game.newBest}
          stars={game.stars}
          scene={game.score > 0 ? "plate" : undefined}
          onReplay={begin}
        />
      )}
    </GameLayout>
  )
}
