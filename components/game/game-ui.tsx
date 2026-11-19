"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, RotateCcw, Sparkles, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Sprite } from "@/components/game/sprite"
import { GameSceneContext, SceneHero, ThemePicker } from "@/components/game/theme"
import type { Scene } from "@/lib/game/atlas"
import { GAME_ICON, readProgress, recordResult, starsFor, type GameId } from "@/lib/game/progress"

export type Phase = "idle" | "playing" | "done"

// most XP one round can give, so no game is a shortcut to leveling up
export const MAX_ROUND_XP = 30

// shared state for every minigame: phase, score and an optional timer.
// each game handles its own board and calls these.
// XP is given once per finished round through addXp in auth-context (which also handles
// leveling up and saving). addXp does nothing when signed out, so guests can still play.
// the round also gets saved to the local minigame progress for the progress bar
export function useGameSession({ id, seconds }: { id: GameId; seconds?: number }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(seconds ?? 0)
  const [xp, setXp] = useState(0) // what the finished round actually awarded
  const [newBest, setNewBest] = useState(false)
  const [stars, setStars] = useState(0)
  const { addXp } = useAuth()
  const awarded = useRef(false)

  const start = useCallback(() => {
    setScore(0)
    setTimeLeft(seconds ?? 0)
    setXp(0)
    setNewBest(false)
    setStars(0)
    awarded.current = false
    setPhase("playing")
  }, [seconds])

  const finish = useCallback(
    (roundXp: number, finalScore?: number) => {
      setPhase("done")
      if (awarded.current) return
      awarded.current = true

      // some games work out the final score in the same tick and pass it in, since setScore
      // hasn't landed yet. the result gets recorded here and not inside a setState updater,
      // because React runs updaters twice in dev
      const final = finalScore ?? score
      const earned = Math.max(0, Math.min(MAX_ROUND_XP, Math.round(roundXp)))
      const previousBest = readProgress()[id]?.best
      recordResult(id, final, earned)
      if (earned > 0) addXp(earned)

      setScore(final)
      setXp(earned)
      setNewBest(previousBest !== undefined && final > previousBest)
      setStars(starsFor(id, final))
    },
    [addXp, id, score],
  )

  // game timer, only runs while playing
  useEffect(() => {
    if (phase !== "playing" || !seconds) return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, seconds])

  return { phase, setPhase, score, setScore, timeLeft, start, finish, xp, newBest, stars }
}

// style for the main buttons in the games (Start, Stop, Next...)
export const primaryButton =
  "rounded-full bg-gradient-to-r from-rose-500 to-pink-500 font-semibold text-white shadow-md shadow-rose-500/25 transition-transform hover:scale-[1.03] hover:from-rose-600 hover:to-pink-600 active:scale-[0.98]"

type TileState = "idle" | "right" | "wrong" | "faded"

// shared look for the tiles you tap in the games (tools, options, pantry items)
export function tileClass(state: TileState = "idle") {
  const base =
    "relative flex flex-col items-center justify-center gap-2 rounded-2xl border bg-gradient-to-b p-3 shadow-sm transition-all duration-150"
  if (state === "right") {
    return `${base} border-emerald-300 from-emerald-50 to-emerald-100/70 ring-2 ring-emerald-400/50 dark:border-emerald-800 dark:from-emerald-950 dark:to-emerald-900/40`
  }
  if (state === "wrong") {
    return `${base} border-rose-300 from-rose-50 to-rose-100/70 ring-2 ring-rose-400/50 dark:border-rose-800 dark:from-rose-950 dark:to-rose-900/40`
  }
  if (state === "faded") {
    return `${base} from-white to-neutral-50 opacity-40 dark:from-neutral-900 dark:to-neutral-950`
  }
  return `${base} from-white to-rose-50/80 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md active:translate-y-0 active:scale-[0.98] dark:from-neutral-900 dark:to-neutral-950 dark:hover:border-rose-700`
}

// 0-3 stars filled in with amber, used on the result card and the hub
export function Stars({
  count,
  size = "h-5 w-5",
  animate = false,
}: {
  count: number
  size?: string
  /** pop the stars in one at a time (used on the result card) */
  animate?: boolean
}) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`${size} ${i < count ? "fill-amber-400 text-amber-500 drop-shadow-sm" : "text-muted-foreground/30"} ${
            animate ? "animate-in fade-in zoom-in-0 fill-mode-both duration-500" : ""
          }`}
          style={animate ? { animationDelay: `${150 + i * 180}ms` } : undefined}
        />
      ))}
    </span>
  )
}

export function GameLayout({
  title,
  blurb,
  game,
  scene,
  hud,
  children,
}: {
  title: string
  blurb: string
  /** shows the game's icon next to the title */
  game?: GameId
  /** kitchen background for this game's cards (in the player's theme) */
  scene?: Scene
  hud?: React.ReactNode
  children: React.ReactNode
}) {
  const icon = game ? GAME_ICON[game] : null
  return (
    <GameSceneContext.Provider value={scene ?? null}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Link
            href="/games"
            className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All games
          </Link>
          <ThemePicker />
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 via-white to-amber-50 shadow-sm ring-1 ring-rose-200/60 dark:from-rose-950/70 dark:via-neutral-900 dark:to-neutral-900 dark:ring-white/10">
                <Sprite sheet={icon.sheet} index={icon.frame} size={46} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{blurb}</p>
            </div>
          </div>
          {hud}
        </div>

        {children}
      </div>
    </GameSceneContext.Provider>
  )
}

// score and timer boxes at the top of every game
export function Hud({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <div key={i.label} className="min-w-[4.75rem] rounded-xl border bg-card px-3 py-1.5 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{i.label}</p>
          {/* re-keyed so the number gives a little pop whenever it changes */}
          <p key={String(i.value)} className="text-xl font-bold tabular-nums animate-in zoom-in-90 duration-200">
            {i.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// the see-through panel that sits on top of the kitchen scene on the start and result screens
const panel =
  "flex w-full max-w-md flex-col items-center gap-5 rounded-3xl bg-white/70 px-6 py-7 text-center shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-950/65 dark:ring-white/10"

export function StartCard({
  howTo,
  onStart,
  cta = "Start game",
  countdown = false,
  hero = [],
}: {
  howTo: string
  onStart: () => void
  cta?: string
  /** count down 3, 2, 1, Go! first, for games where the clock starts right away */
  countdown?: boolean
  /** a few sprites to show on the start screen (the middle one is bigger) */
  hero?: { sheet: string; frame: number }[]
}) {
  const [count, setCount] = useState<number | null>(null)

  // tick the countdown down; at 0 show "Go!" for a moment, then start
  useEffect(() => {
    if (count === null) return
    const timer = setTimeout(() => (count === 0 ? onStart() : setCount(count - 1)), count === 0 ? 450 : 650)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const middle = Math.floor(hero.length / 2)

  return (
    <SceneHero>
      <div className={panel}>
        {hero.length > 0 && (
          <div className="flex items-end justify-center gap-2">
            {hero.map((h, i) => (
              <Sprite
                key={i}
                sheet={h.sheet}
                index={h.frame}
                size={i === middle ? 76 : 52}
                className="drop-shadow-lg"
              />
            ))}
          </div>
        )}
        <p className="text-muted-foreground">{howTo}</p>
        {count === null ? (
          <Button
            size="lg"
            className={`${primaryButton} px-10`}
            onClick={() => (countdown ? setCount(3) : onStart())}
          >
            {cta}
          </Button>
        ) : (
          <span
            key={count}
            aria-live="assertive"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-2xl font-black text-white shadow-lg shadow-rose-500/30 animate-in zoom-in-50 fade-in duration-300"
          >
            {count === 0 ? "Go!" : count}
          </span>
        )}
      </div>
    </SceneHero>
  )
}

export function ResultCard({
  headline,
  detail,
  xp,
  newBest = false,
  stars,
  scene,
  onReplay,
}: {
  headline: string
  detail: string
  /** pass the session's `xp` so the card shows what was actually given */
  xp: number
  newBest?: boolean
  /** pass the session's `stars` (0-3) */
  stars?: number
  /** background for the results if it's not the game's normal scene (like "plate" after serving food) */
  scene?: Scene
  onReplay: () => void
}) {
  const { user } = useAuth()
  return (
    <SceneHero scene={scene}>
      <div className={`${panel} gap-4`}>
        <Trophy className="h-10 w-10 text-amber-500 drop-shadow" />
        {stars !== undefined && <Stars count={stars} size="h-9 w-9" animate />}
        {newBest && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 shadow-sm dark:from-amber-900/70 dark:to-amber-900/40 dark:text-amber-200">
            <Sparkles className="h-3.5 w-3.5" /> New best!
          </span>
        )}
        <div>
          <h2 className="text-3xl font-black tracking-tight">{headline}</h2>
          <p className="text-muted-foreground">{detail}</p>
        </div>
        <p className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
          {xp > 0 ? `+${xp} XP` : "No XP this round"}
          {xp > 0 && !user && " (sign in to keep it)"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Button onClick={onReplay} className={primaryButton}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/games">All games</Link>
          </Button>
        </div>
      </div>
    </SceneHero>
  )
}

// progress bar inside a round (ingredients in the pot, dishes cooked, pairs found)
// so you can always see how far along you are
export function TaskProgress({
  label,
  done,
  total,
  unit,
}: {
  label: string
  done: number
  total: number
  /** optional word after the count, like "ingredients" */
  unit?: string
}) {
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  const complete = done >= total && total > 0

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {done}/{total}{unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label}: ${done} of ${total} complete`}
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-2.5 overflow-hidden rounded-full bg-rose-100 dark:bg-white/10"
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
            complete ? "from-emerald-400 to-emerald-500" : "from-rose-400 to-pink-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
