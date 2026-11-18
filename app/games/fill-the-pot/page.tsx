"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { ALL_INGREDIENTS, POT_BOILED_OVER, POT_STAGES, RECIPES, type Item, type Recipe } from "@/lib/game/items"

const ROUNDS = 3
const STRIKES = 3
const CLEAN_BONUS = 50 // for serving a dish with no wrong ingredients
const COOK_SECONDS = 18
const ING_SHEET = "ingredients1"
const POT_SHEET = "cookware1"
// how long the recipe stays on screen (gets shorter each dish)
const previewMsFor = (round: number) => Math.max(1600, 3200 - round * 700)
// the pantry gets bigger each dish: 12, then 15, then 18 things to pick from
const pantrySizeFor = (round: number) => 12 + round * 3

type Stage = "preview" | "cooking" | "served" | "failed"

export default function FillThePotPage() {
  const game = useGameSession({ id: "fill-the-pot" })
  const { theme } = useGameTheme()
  const [queue, setQueue] = useState<Recipe[]>([])
  const [round, setRound] = useState(0)
  const [stage, setStage] = useState<Stage>("preview")
  const [pantry, setPantry] = useState<Item[]>([])
  const [added, setAdded] = useState<number[]>([])
  const [strikes, setStrikes] = useState(0)
  const [secondsLeft, setSeconds] = useState(COOK_SECONDS)
  const [flash, setFlash] = useState<number | null>(null)
  const [served, setServed] = useState(0)
  const [dishMistakes, setDishMistakes] = useState(0)
  const [servedNote, setServedNote] = useState({ timeBonus: 0, clean: false })
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recipe = queue[round]

  const deal = useCallback((r: Recipe, roundIndex: number) => {
    const fillers = shuffle(
      ALL_INGREDIENTS.filter((i) => !r.needs.some((n) => n.frame === i.frame)),
    ).slice(0, pantrySizeFor(roundIndex) - r.needs.length)
    setPantry(shuffle([...r.needs, ...fillers]))
    setAdded([])
    setDishMistakes(0)
    setSeconds(COOK_SECONDS)
    setStage("preview")
  }, [])

  function begin() {
    const q = shuffle(RECIPES).slice(0, ROUNDS)
    preloadScenes(theme, ["plate"]) // the table scene shows up when a dish is served
    setQueue(q)
    setRound(0)
    setStrikes(0)
    setServed(0)
    deal(q[0], 0)
    game.start()
  }

  // show the recipe for a bit, then hide it
  useEffect(() => {
    if (game.phase !== "playing" || stage !== "preview") return
    if (previewTimer.current) clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(() => setStage("cooking"), previewMsFor(round))
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [game.phase, stage, round])

  // cooking timer, running out means the dish failed
  useEffect(() => {
    if (game.phase !== "playing" || stage !== "cooking") return
    const id = setInterval(() => {
      setSeconds((t) => {
        if (t <= 1) {
          clearInterval(id)
          setStage("failed")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [game.phase, stage])

  function addToPot(item: Item) {
    if (stage !== "cooking" || !recipe || added.includes(item.frame)) return

    if (recipe.needs.some((n) => n.frame === item.frame)) {
      const next = [...added, item.frame]
      setAdded(next)
      game.setScore((s) => s + 50)
      if (next.length === recipe.needs.length) {
        // finishing fast is worth more, and no mistakes gets a little extra
        const clean = dishMistakes === 0
        game.setScore((s) => s + secondsLeft * 5 + (clean ? CLEAN_BONUS : 0))
        setServedNote({ timeBonus: secondsLeft * 5, clean })
        setServed((v) => v + 1)
        setStage("served")
      }
    } else {
      const hit = strikes + 1
      setStrikes(hit)
      setDishMistakes((m) => m + 1)
      setFlash(item.frame)
      setTimeout(() => setFlash(null), 350)
      game.setScore((s) => Math.max(0, s - 25))
      if (hit >= STRIKES) setStage("failed")
    }
  }

  function next() {
    const last = round === queue.length - 1
    if (last || strikes >= STRIKES) {
      game.finish(Math.round(game.score / 25))
      return
    }
    const n = round + 1
    setRound(n)
    deal(queue[n], n)
  }

  const potFrame =
    stage === "failed" ? POT_BOILED_OVER : POT_STAGES[Math.min(added.length, POT_STAGES.length - 1)]
  const showRecipe = stage === "preview" || stage === "served" || stage === "failed"

  return (
    <GameLayout
      title="Fill the Pot"
      game="fill-the-pot"
      scene="pot"
      blurb="Study the recipe, then cook it from memory."
      hud={
        game.phase === "playing"
          ? (
            <Hud
              items={[
                { label: "Dish", value: `${round + 1}/${queue.length}` },
                { label: "Time", value: stage === "cooking" ? `${secondsLeft}s` : "-" },
                { label: "Strikes", value: `${strikes}/${STRIKES}` },
                { label: "Score", value: game.score },
              ]}
            />
          )
          : undefined
      }
    >
      {game.phase === "idle" && (
        <StartCard
          howTo={`You get a few seconds to look at each recipe before it disappears. Then add the 4 ingredients from memory before the ${COOK_SECONDS} second timer runs out. The pantry gets bigger every dish, you get a bonus for no mistakes, and 3 wrong ingredients ends the game.`}
          onStart={begin}
          countdown
          hero={[
            { sheet: ING_SHEET, frame: 7 },
            { sheet: POT_SHEET, frame: 54 },
            { sheet: ING_SHEET, frame: 97 },
          ]}
        />
      )}

      {game.phase === "playing" && recipe && (
        <div className="space-y-6">
          <SceneCard
            soft
            scene={stage === "served" ? "plate" : undefined}
            contentClassName="flex flex-col items-center gap-4 py-7"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {stage === "preview" ? "Memorize this" : stage === "cooking" ? "Cooking" : "The recipe was"}
            </p>
            <h2 className="text-2xl font-black tracking-tight">{recipe.name}</h2>

            {/* key changes on every add, so the pot does a little bounce */}
            <div key={`${added.length}-${stage}`} className="animate-in zoom-in-90 duration-200">
              <Sprite sheet={POT_SHEET} index={potFrame} size={140} title="Pot" className="drop-shadow-xl" />
            </div>

            {stage === "served" && (
              <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 animate-in fade-in slide-in-from-bottom-1 dark:bg-emerald-950/60 dark:text-emerald-300">
                Served! +{servedNote.timeBonus} for speed{servedNote.clean && `, +${CLEAN_BONUS} for no mistakes`}
              </p>
            )}

            <div className="w-full max-w-sm space-y-3 pt-1">
              <TaskProgress label="This dish" done={added.length} total={recipe.needs.length} unit="added" />
              <TaskProgress label="Dishes served" done={served} total={queue.length} />
            </div>

            {/* the recipe only shows before and after cooking, during cooking you just get empty slots */}
            <div className="flex flex-wrap justify-center gap-3">
              {recipe.needs.map((n, i) => {
                const inPot = added.includes(n.frame)
                if (showRecipe) {
                  return (
                    <div
                      key={n.frame}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm ${
                        inPot
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60"
                          : "bg-white/90 dark:bg-neutral-900/90"
                      }`}
                    >
                      <Sprite sheet={ING_SHEET} index={n.frame} size={24} />
                      <span className="text-xs font-semibold">{n.name}</span>
                      {inPot && <span className="text-xs text-emerald-600">✓</span>}
                    </div>
                  )
                }
                const filled = added[i] !== undefined
                return (
                  <div
                    key={n.frame}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed ${
                      filled
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
                        : "border-rose-300 bg-white/60 dark:border-white/25 dark:bg-white/5"
                    }`}
                  >
                    {filled ? <Sprite sheet={ING_SHEET} index={added[i]} size={26} /> : null}
                  </div>
                )
              })}
            </div>

            {(stage === "served" || stage === "failed") && (
              <Button onClick={next} className={`${primaryButton} mt-1`}>
                {stage === "failed"
                  ? strikes >= STRIKES ? "See results" : "Next dish"
                  : round === queue.length - 1 ? "Finish" : "Serve it up"}
              </Button>
            )}

            {stage === "failed" && (
              <p className="text-sm font-semibold text-rose-600">
                {strikes >= STRIKES ? "3 strikes, game over." : "Ran out of time on that one."}
              </p>
            )}
          </SceneCard>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pantry</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
              {pantry.map((item) => {
                const used = added.includes(item.frame)
                const look = used
                  ? `${tileClass("right")} opacity-60`
                  : flash === item.frame
                    ? tileClass("wrong")
                    : stage === "cooking"
                      ? tileClass("idle")
                      : tileClass("faded")
                return (
                  <button
                    key={item.frame}
                    onClick={() => addToPot(item)}
                    disabled={used || stage !== "cooking"}
                    aria-label={item.name}
                    className={look}
                  >
                    <Sprite sheet={ING_SHEET} index={item.frame} size={44} />
                    <span className="text-[11px] font-semibold leading-tight">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {game.phase === "done" && (
        <ResultCard
          headline={`${game.score} points`}
          detail={
            strikes >= STRIKES
              ? `Game over after 3 wrong ingredients. You served ${served} dish${served === 1 ? "" : "es"}.`
              : `${served} of ${queue.length} dishes served, ${strikes} mistake${strikes === 1 ? "" : "s"}.`
          }
          xp={game.xp}
          newBest={game.newBest}
          stars={game.stars}
          scene={served > 0 ? "plate" : undefined}
          onReplay={begin}
        />
      )}
    </GameLayout>
  )
}
