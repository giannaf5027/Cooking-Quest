"use client"

const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='42' r='22' fill='%23d1d5db'/%3E%3Cpath d='M22 88c0-16 12-28 28-28s28 12 28 28' fill='%23d1d5db'/%3E%3C/svg%3E"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock recipe data
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Spaghetti with Meatballs",
    image: PH,
    spiceLevel: 2,
    cookTime: "30-35 minutes",
    tags: ["Italian", "Pasta", "Meat"],
  },
  {
    id: "2",
    title: "Vegetable Stir Fry",
    image: PH,
    spiceLevel: 3,
    cookTime: "15-20 minutes",
    tags: ["Vegetarian", "Asian", "Quick"],
  },
  {
    id: "3",
    title: "Chocolate Chip Cookies",
    image: PH,
    spiceLevel: 0,
    cookTime: "40-60 minutes",
    tags: ["Dessert", "Baking", "Sweet"],
  },
  {
    id: "4",
    title: "Beef Tacos",
    image: PH,
    spiceLevel: 4,
    cookTime: "30-35 minutes",
    tags: ["Mexican", "Spicy", "Meat"],
  },
  {
    id: "5",
    title: "Vegetarian Pizza",
    image: PH,
    spiceLevel: 1,
    cookTime: "40-60 minutes",
    tags: ["Italian", "Vegetarian", "Baking"],
  },
  {
    id: "6",
    title: "Chicken Curry",
    image: PH,
    spiceLevel: 5,
    cookTime: "40-60 minutes",
    tags: ["Indian", "Spicy", "Meat"],
  },
]

interface RecipeSearchListProps {
  onSelectRecipe: (id: string, title: string, image: string) => void
}

export function RecipeSearchList({ onSelectRecipe }: RecipeSearchListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter recipes based on search query
  const filteredRecipes = MOCK_RECIPES.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search recipes..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
              onClick={() => onSelectRecipe(recipe.id, recipe.title, recipe.image)}
            >
              <div className="w-12 h-12 rounded overflow-hidden">
                <img
                  src={PH}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{recipe.title}</div>
                <div className="text-xs text-muted-foreground">{recipe.cookTime}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
