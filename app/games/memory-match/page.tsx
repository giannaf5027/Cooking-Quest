"use client"

import { useEffect, useState } from "react"
import { ChefHat } from "lucide-react"
import { Sprite } from "@/components/game/sprite"
import { SceneCard } from "@/components/game/theme"
import { GameLayout, Hud, ResultCard, StartCard, TaskProgress, useGameSession } from "@/components/game/game-ui"
import { shuffle } from "@/lib/game/atlas"
import { pickIngredients, type Item } from "@/lib/game/items"

const PAIRS = 8
const SHEET = "ingredients1"
const FLIP_BACK_MS = 850

// each ingredient gets a picture card and a name card, so you learn the names too
type Tile = { key: number; item: Item; kind: "picture" | "name"; matched: boolean }

export default function MemoryMatchPage() {
  const game = useGameSession({ id: "memory-match" })
  const [tiles, setTiles] = useState<Tile[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)

  function begin() {
    // only the named ingredients, so no two cards look the same by accident
    const items = pickIngredients(PAIRS)
    const cards = items.flatMap((item) => [
      { item, kind: "picture" as const },
      { item, kind: "name" as const },
    ])
    const deck = shuffle(cards).map((card, key) => ({ ...card, key, matched: false }))
    setTiles(deck)
    setFlipped([])
    setMoves(0)
    setLocked(false)
    game.start()
  }

  function flip(i: number) {
    if (locked || flipped.includes(i) || tiles[i].matched) return
    const next = [...flipped, i]
    setFlipped(next)
    if (next.length < 2) return

    setMoves((m) => m + 1)
    const [a, b] = next
    if (tiles[a].item.frame === tiles[b].item.frame) {
      setTiles((t) => t.map((tile, i2) => (i2 === a || i2 === b ? { ...tile, matched: true } : tile)))
      setFlipped([])
    } else {
      // leave the wrong pair showing for a moment so you can remember them
      setLocked(true)
      setTimeout(() => {
        setFlipped([])
        setLocked(false)
      }, FLIP_BACK_MS)
    }
  }

  // game ends when every pair is found, fewer moves = more points
  useEffect(() => {
    if (game.phase !== "playing" || tiles.length === 0) return
    if (tiles.every((t) => t.matched)) {
      const score = Math.max(0, PAIRS * 100 - (moves - PAIRS) * 15)
      // score is worked out here instead of in game.score, so pass it in
      game.finish(Math.max(5, Math.round(score / 40)), score)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles])

  const matchedPairs = tiles.filter((t) => t.matched).length / 2

  return (
    <GameLayout
      title="Memory Match"
      game="memory-match"
      scene="pantry"
      blurb="Match each ingredient to its name in as few moves as you can."
      hud={
        game.phase === "playing"
          ? <Hud items={[{ label: "Pairs", value: `${matchedPairs}/${PAIRS}` }, { label: "Moves", value: moves }]} />
          : undefined
      }
    >
      {game.phase === "idle" && (
        <StartCard
          howTo={`Flip two cards at a time and match each picture to its name. There are ${PAIRS} pairs. The fewer moves you take, the more stars you get.`}
          onStart={begin}
          hero={[
            { sheet: SHEET, frame: 90 },
            { sheet: SHEET, frame: 7 },
            { sheet: SHEET, frame: 32 },
          ]}
        />
      )}

      {game.phase === "playing" && (
        <div className="space-y-5">
          <TaskProgress label="Pairs found" done={matchedPairs} total={PAIRS} />
          <SceneCard soft contentClassName="p-3 sm:p-5">
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {tiles.map((tile, i) => {
                const shown = tile.matched || flipped.includes(i)
                return (
                  <button
                    key={tile.key}
                    onClick={() => flip(i)}
                    disabled={shown || locked}
                    aria-label={shown ? `${tile.item.name} ${tile.kind === "name" ? "name card" : "picture"}` : "Hidden card"}
                    className="group aspect-square transition-transform [perspective:700px] enabled:hover:-translate-y-0.5 enabled:active:scale-[0.97] disabled:cursor-default"
                  >
                    {/* one card with two sides, flipping turns the whole card over */}
                    <div
                      className={`relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:transition-none ${
                        shown ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* back of the card */}
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-md [backface-visibility:hidden] group-enabled:group-hover:from-rose-500 group-enabled:group-hover:to-pink-600">
                        <div className="absolute inset-1.5 rounded-xl border-2 border-white/30" />
                        <ChefHat className="h-1/3 w-1/3 text-white/85" />
                      </div>
                      {/* front of the card */}
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-gradient-to-b shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                          tile.matched
                            ? "border-emerald-300 from-emerald-50 to-emerald-100 dark:border-emerald-800 dark:from-emerald-950 dark:to-emerald-900"
                            : "border-rose-300 from-white to-rose-50 dark:border-rose-800 dark:from-neutral-900 dark:to-neutral-950"
                        }`}
                      >
                        {tile.kind === "name" ? (
                          <span
                            className={`px-1 text-center text-xs font-bold leading-tight hyphens-auto [overflow-wrap:anywhere] sm:text-base ${
                              tile.matched ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
                            }`}
                          >
                            {tile.item.name}
                          </span>
                        ) : (
                          <>
                            <Sprite sheet={SHEET} index={tile.item.frame} size={tile.matched ? 48 : 60} />
                            {tile.matched && (
                              <span className="line-clamp-1 px-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                {tile.item.name}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </SceneCard>
        </div>
      )}

      {game.phase === "done" && (
        <ResultCard
          headline="All matched!"
          detail={`You found all ${PAIRS} pairs in ${moves} moves.`}
          xp={game.xp}
          newBest={game.newBest}
          stars={game.stars}
          onReplay={begin}
        />
      )}
    </GameLayout>
  )
}
