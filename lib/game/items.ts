// names for the sprite frames the games use.
// the sheets don't come with labels, so these were matched up by hand from a numbered render of each sheet.
// only frames that look clearly different are named, since the sheet has near duplicates
// (3 cookies, 4 red diced cubes) that would make the picture games unfair

import { shuffle, type Scene } from "@/lib/game/atlas"

export type Item = { frame: number; name: string }

// frames from <theme>/ingredients1
export const INGREDIENTS = {
  egg: { frame: 0, name: "Egg" },
  friedEgg: { frame: 3, name: "Fried egg" },
  tomato: { frame: 7, name: "Tomato" },
  onion: { frame: 12, name: "Onion" },
  noodles: { frame: 16, name: "Pasta" },
  potato: { frame: 17, name: "Potato" },
  cauliflower: { frame: 22, name: "Cauliflower" },
  carrot: { frame: 23, name: "Carrot" },
  cabbage: { frame: 28, name: "Cabbage" },
  mushroom: { frame: 32, name: "Mushroom" },
  redPepper: { frame: 36, name: "Red pepper" },
  yellowPepper: { frame: 40, name: "Yellow pepper" },
  greenPepper: { frame: 44, name: "Green pepper" },
  greenBeans: { frame: 46, name: "Green beans" },
  peas: { frame: 49, name: "Peas" },
  corn: { frame: 50, name: "Corn" },
  cheese: { frame: 52, name: "Cheese" },
  butter: { frame: 57, name: "Butter" },
  bread: { frame: 60, name: "Bread" },
  toast: { frame: 62, name: "Toast" },
  chicken: { frame: 64, name: "Chicken" },
  steak: { frame: 68, name: "Steak" },
  sausage: { frame: 69, name: "Sausages" },
  salmon: { frame: 75, name: "Salmon" },
  dough: { frame: 78, name: "Dough" },
  cookie: { frame: 83, name: "Cookie" },
  strawberry: { frame: 86, name: "Strawberry" },
  lemon: { frame: 90, name: "Lemon" },
  basil: { frame: 94, name: "Basil" },
  parsley: { frame: 95, name: "Parsley" },
  rosemary: { frame: 96, name: "Rosemary" },
  garlic: { frame: 97, name: "Garlic" },
  salt: { frame: 101, name: "Salt" },
} satisfies Record<string, Item>

// frames from <theme>/cookware2
export const TOOLS = {
  spatula: { frame: 0, name: "Spatula" },
  whisk: { frame: 2, name: "Whisk" },
  ladle: { frame: 4, name: "Ladle" },
  tongs: { frame: 5, name: "Tongs" },
  peeler: { frame: 6, name: "Peeler" },
  grater: { frame: 8, name: "Grater" },
  board: { frame: 10, name: "Cutting board" },
  chefKnife: { frame: 12, name: "Chef's knife" },
  breadKnife: { frame: 14, name: "Bread knife" },
  paringKnife: { frame: 15, name: "Paring knife" },
  cleaver: { frame: 16, name: "Cleaver" },
  scissors: { frame: 17, name: "Kitchen scissors" },
  colander: { frame: 20, name: "Colander" },
  measuringSpoons: { frame: 23, name: "Measuring spoons" },
  rollingPin: { frame: 25, name: "Rolling pin" },
  pastryBrush: { frame: 26, name: "Pastry brush" },
  mortar: { frame: 27, name: "Mortar & pestle" },
} satisfies Record<string, Item>

export type PrepTask = {
  ingredient: Item
  tool: Item
  /** shown after you answer, so you learn why */
  why: string
  /** where in the kitchen this happens (used as the card background) */
  scene: Scene
}

// which tool goes with which ingredient
export const PREP_TASKS: PrepTask[] = [
  { ingredient: INGREDIENTS.carrot, tool: TOOLS.peeler, scene: "board", why: "Peel carrots before chopping." },
  { ingredient: INGREDIENTS.potato, tool: TOOLS.peeler, scene: "sink", why: "A peeler takes the skin off without wasting the potato." },
  { ingredient: INGREDIENTS.cheese, tool: TOOLS.grater, scene: "bowl", why: "Grate hard cheese so it melts evenly." },
  { ingredient: INGREDIENTS.egg, tool: TOOLS.whisk, scene: "bowl", why: "Whisk eggs to beat air through them." },
  { ingredient: INGREDIENTS.bread, tool: TOOLS.breadKnife, scene: "board", why: "A serrated blade saws through crust without squashing the loaf." },
  { ingredient: INGREDIENTS.dough, tool: TOOLS.rollingPin, scene: "board", why: "Roll dough out to an even thickness." },
  { ingredient: INGREDIENTS.garlic, tool: TOOLS.mortar, scene: "board", why: "Crushing garlic gives it more flavor than slicing it." },
  { ingredient: INGREDIENTS.noodles, tool: TOOLS.colander, scene: "sink", why: "Drain pasta in a colander as soon as it's done." },
  { ingredient: INGREDIENTS.onion, tool: TOOLS.chefKnife, scene: "board", why: "A chef's knife gives you control for even dice." },
  { ingredient: INGREDIENTS.sausage, tool: TOOLS.tongs, scene: "skillet", why: "Turn sausages with tongs so you don't pierce them." },
  { ingredient: INGREDIENTS.strawberry, tool: TOOLS.paringKnife, scene: "sink", why: "Rinse strawberries, then take the leafy tops off with a small paring knife." },
  { ingredient: INGREDIENTS.basil, tool: TOOLS.scissors, scene: "board", why: "Snip soft herbs with kitchen scissors so the leaves don't bruise." },
  { ingredient: INGREDIENTS.butter, tool: TOOLS.pastryBrush, scene: "skillet", why: "Brush melted butter on with a pastry brush for a thin, even coat." },
  { ingredient: INGREDIENTS.salt, tool: TOOLS.measuringSpoons, scene: "bowl", why: "Measure salt with spoons. A little goes a long way!" },
  { ingredient: INGREDIENTS.chicken, tool: TOOLS.cleaver, scene: "board", why: "A heavy cleaver chops through chicken bones that would chip a chef's knife." },
]

export type Recipe = { name: string; needs: Item[] }

// 4 ingredient recipes for Fill the Pot
export const RECIPES: Recipe[] = [
  { name: "Tomato soup", needs: [INGREDIENTS.tomato, INGREDIENTS.onion, INGREDIENTS.garlic, INGREDIENTS.basil] },
  { name: "Veggie stew", needs: [INGREDIENTS.carrot, INGREDIENTS.potato, INGREDIENTS.onion, INGREDIENTS.greenBeans] },
  { name: "Pasta bake", needs: [INGREDIENTS.noodles, INGREDIENTS.tomato, INGREDIENTS.cheese, INGREDIENTS.basil] },
  { name: "Chicken dinner", needs: [INGREDIENTS.chicken, INGREDIENTS.potato, INGREDIENTS.carrot, INGREDIENTS.rosemary] },
  { name: "Mushroom risotto", needs: [INGREDIENTS.mushroom, INGREDIENTS.onion, INGREDIENTS.butter, INGREDIENTS.cheese] },
]

// pot frames from <theme>/cookware1 as the pot fills up: lid on, boiling water, stew
export const POT_STAGES = [52, 53, 53, 54, 54]

// the same pot boiling over, for when a dish fails
export const POT_BOILED_OVER = 55

export const ALL_INGREDIENTS = Object.values(INGREDIENTS)
export const ALL_TOOLS = Object.values(TOOLS)

// n different ingredients in random order
export function pickIngredients(n: number): Item[] {
  return shuffle(ALL_INGREDIENTS).slice(0, n)
}
