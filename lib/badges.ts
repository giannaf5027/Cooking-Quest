// xp milestone badges (KAN-6) - same idea as recipesForLevel in auth-context.tsx
// icons come from Gianna's badge sprite sheets (components/game-assets/badges) -
// each sheet is a 4x2 grid, so a badge is just a sheet + which cell it's in

import xpSheet from "@/components/game-assets/badges/XP.png"
import typeSheet from "@/components/game-assets/badges/type.png"
import dietSheet from "@/components/game-assets/badges/diet.png"

export type Badge = {
    id: string
    name: string
    xpRequired: number
    sheet: { src: string }
    col: number // 0-3
    row: number // 0-1
}

export const BADGES: Badge[] = [
    { id: "new-recipe", name: "New Recipe", xpRequired: 50, sheet: xpSheet, col: 0, row: 0 },
    { id: "chop-champ", name: "Chop Champ", xpRequired: 100, sheet: typeSheet, col: 0, row: 0 },
    { id: "saute-savvy", name: "Saute Savvy", xpRequired: 200, sheet: typeSheet, col: 1, row: 0 },
    { id: "adventurous-chef", name: "Adventurous Chef", xpRequired: 300, sheet: xpSheet, col: 1, row: 0 },
    { id: "prep-pro", name: "Prep Pro", xpRequired: 400, sheet: dietSheet, col: 0, row: 1 },
    { id: "oven-pro", name: "Oven Pro", xpRequired: 500, sheet: typeSheet, col: 2, row: 0 },
    { id: "recipe-ranger", name: "Recipe Ranger", xpRequired: 750, sheet: xpSheet, col: 2, row: 0 },
    { id: "grill-master", name: "Grill Master", xpRequired: 1000, sheet: typeSheet, col: 3, row: 0 },
    { id: "sous-chef", name: "Sous Chef", xpRequired: 1500, sheet: dietSheet, col: 3, row: 1 },
    { id: "bake-boss", name: "Bake Boss", xpRequired: 2000, sheet: typeSheet, col: 2, row: 1 },
    { id: "recipe-legend", name: "Recipe Legend", xpRequired: 3000, sheet: xpSheet, col: 3, row: 0 },
    { id: "sear-specialist", name: "Sear Specialist", xpRequired: 5000, sheet: typeSheet, col: 3, row: 1 },
]

// badges earned at a given xp total
export function getEarnedBadges(xp: number): Badge[] {
    return BADGES.filter((badge) => xp >= badge.xpRequired)
}
