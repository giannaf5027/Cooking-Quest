// xp milestone badges (KAN-6) - same idea as recipesForLevel in auth-context.tsx

export type Badge = {
    id: string
    name: string
    xpRequired: number
}

export const BADGES: Badge[] = [
    { id: "first-bite", name: "First Bite", xpRequired: 50 },
    { id: "getting-started", name: "Getting Started", xpRequired: 100 },
    { id: "rising-chef", name: "Rising Chef", xpRequired: 200 },
    { id: "kitchen-regular", name: "Kitchen Regular", xpRequired: 300 },
    { id: "flavor-explorer", name: "Flavor Explorer", xpRequired: 400 },
    { id: "recipe-collector", name: "Recipe Collector", xpRequired: 500 },
    { id: "sous-chef", name: "Sous Chef", xpRequired: 750 },
    { id: "head-chef", name: "Head Chef", xpRequired: 1000 },
    { id: "kitchen-veteran", name: "Kitchen Veteran", xpRequired: 1500 },
    { id: "culinary-expert", name: "Culinary Expert", xpRequired: 2000 },
    { id: "master-chef", name: "Master Chef", xpRequired: 3000 },
    { id: "legendary-cook", name: "Legendary Cook", xpRequired: 5000 },
]

// badges earned at a given xp total
export function getEarnedBadges(xp: number): Badge[] {
    return BADGES.filter((badge) => xp >= badge.xpRequired)
}
