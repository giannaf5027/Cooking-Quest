import { RECIPE_INGREDIENTS } from "./ingredients"

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Pantry", ["coconut milk"]],
  ["Frozen", ["frozen"]],
  ["Meat & Seafood", ["beef", "chicken", "pork", "shrimp", "tuna", "turkey", "ground beef", "fish"]],
  ["Dairy & Eggs", ["egg", "cheese", "butter", "milk", "cream", "mozzarella", "parmesan", "yogurt", "sour cream"]],
  ["Pantry", [
    "canned", "cans", "can ", "paste", "jar", "oil", "sugar", "flour", "spice", "salt",
    "cumin", "curry", "soy", "rice", "pasta", "spaghetti", "tortilla", "breadcrumb",
    "chocolate", "vanilla", "honey", "sesame", "dough", "black pepper", "oregano", "olives",
  ]],
  ["Produce", [
    "onion", "garlic", "basil", "tomato", "pepper", "peppers", "mushroom", "carrot",
    "broccoli", "spinach", "lettuce", "lime", "cilantro", "ginger", "zucchini", "potato",
    "peas", "corn", "celery",
  ]],
]

export function categorize(ingredient: string): string {
  const lower = ingredient.toLowerCase()
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return "Other"
}

export function parseIngredient(ingredient: string): { qty: number | null; unit: string | null; rest: string } {
  const mixed = ingredient.match(/^(\d+)\s+(\d+\/\d+)\s+(\S+)(?:\s+(.*))?$/)
  if (mixed) {
    const whole = parseInt(mixed[1], 10)
    const [num, den] = mixed[2].split("/").map((n) => parseInt(n, 10))
    return { qty: whole + num / den, unit: mixed[3], rest: mixed[4] ?? "" }
  }
  const fraction = ingredient.match(/^(\d+\/\d+)\s+(\S+)(?:\s+(.*))?$/)
  if (fraction) {
    const [num, den] = fraction[1].split("/").map((n) => parseInt(n, 10))
    return { qty: num / den, unit: fraction[2], rest: fraction[3] ?? "" }
  }
  const whole = ingredient.match(/^(\d+(?:\.\d+)?)\s+(\S+)(?:\s+(.*))?$/)
  if (whole) {
    return { qty: parseFloat(whole[1]), unit: whole[2], rest: whole[3] ?? "" }
  }
  return { qty: null, unit: null, rest: ingredient }
}

// Fixed a merging issue where "tablespoon" and "tablespoons" are now one item instead of multiple lines
export function lineKey(unit: string | null, rest: string): string {
  const raw = unit ? `${unit} ${rest}` : rest
  const base = raw.split(",")[0].toLowerCase().trim()
  return base
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.endsWith("s") && word.length > 2 ? word.slice(0, -1) : word))
    .join(" ")
}

// Adds quantities together the way recipes write them.
// 0.5 of an onion shows as 1/2, and 3 of them adds up to 1 1/2 onions.
export function formatQty(qty: number): string {
  if (Number.isInteger(qty)) return String(qty)
  const whole = Math.floor(qty)
  const frac = qty - whole
  const fracTable: [number, string][] = [
    [0.25, "1/4"],
    [1 / 3, "1/3"],
    [0.333333, "1/3"],
    [0.5, "1/2"],
    [0.666667, "2/3"],
    [0.75, "3/4"],
  ]
  const fracStr = fracTable.find(([v]) => Math.abs(v - frac) < 0.01)?.[1]
  if (fracStr) return whole > 0 ? `${whole} ${fracStr}` : fracStr
  return whole > 0 ? `${whole} ${frac.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}` : frac.toFixed(2)
}

// Combines the ingredients; duplicates are added together.
// When the same item shows up in different units (1/4 cup next to tablespoons),
// everything is converted to the smallest unit first so it sums into one line.
const UNIT_TO_TABLESPOONS: Record<string, number> = {
  cup: 16,
  "fluid ounce": 4 / 3,
  "fl oz": 4 / 3,
  tablespoon: 1,
  teaspoon: 1 / 3,
}

const unitBase = (unit: string): string => unit.toLowerCase().replace(/s$/, "")

export function buildGroceryLines(mealIds: string[]): { key: string; label: string; qty: number | null }[] {
  const items: { rest: string; unit: string | null; qty: number | null }[] = []
  for (const id of mealIds) {
    for (const ingredient of RECIPE_INGREDIENTS[id] ?? []) {
      items.push(parseIngredient(ingredient))
    }
  }
  // pick the smallest convertible unit per item name when it shows up in more than one
  const targetByRest = new Map<string, string>()
  for (const rest of new Set(items.filter((i) => i.unit).map((i) => i.rest))) {
    const units = new Set(items.filter((i) => i.rest === rest && i.unit).map((i) => unitBase(i.unit!)))
    if (units.size > 1 && [...units].every((u) => UNIT_TO_TABLESPOONS[u] !== undefined)) {
      let target = ""
      for (const u of units) {
        if (!target || UNIT_TO_TABLESPOONS[u] < UNIT_TO_TABLESPOONS[target]) target = u
      }
      targetByRest.set(rest, target)
    }
  }
  const merged = new Map<string, { label: string; qty: number | null }>()
  for (const item of items) {
    let unit = item.unit
    let qty = item.qty
    const target = unit ? targetByRest.get(item.rest) : undefined
    if (unit && qty !== null && target) {
      qty = (qty * UNIT_TO_TABLESPOONS[unitBase(unit)]) / UNIT_TO_TABLESPOONS[target]
      unit = target
    }
    const key = lineKey(unit ?? "", item.rest)
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, {
        label: qty === null ? item.rest : `${formatQty(qty)} ${unit} ${item.rest}`.replace(/\s+$/, ""),
        qty,
      })
    } else if (qty !== null) {
      existing.qty = (existing.qty ?? 0) + qty
      const displayUnit = pluralizeUnit(unit ?? "", existing.qty)
      existing.label = `${formatQty(existing.qty)} ${displayUnit} ${item.rest}`.replace(/\s+$/, "")
    }
  }
  return Array.from(merged.entries()).map(([key, { label, qty }]) => ({ key, label, qty }))
}

function pluralizeUnit(unit: string, qty: number): string {
  if (!unit || qty <= 1 || unit.endsWith("s")) return unit
  const comma = unit.endsWith(",") ? "," : ""
  return unit.replace(/,$/, "") + "s" + comma
}
