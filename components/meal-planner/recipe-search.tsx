"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock recipe data
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Spaghetti with Meatballs",
    image: "/placeholder.svg?height=300&width=400",
    spiceLevel: 2,
    cookTime: "30-35 minutes",
    tags: ["Italian", "Pasta", "Meat"],
  },
  {
    id: "2",
    title: "Vegetable Stir Fry",
    image: "/placeholder.svg?height=300&width=400",
    spiceLevel: 3,
    cookTime: "15-20 minutes",
    tags: ["Vegetarian", "Asian", "Quick"],
  },
  {
    id: "3",
    title: "Chocolate Chip Cookies",
    image: "/placeholder.svg?height=300&width=400",
    spiceLevel: 0,
    cookTime: "40-60 minutes",
    tags: ["Dessert", "Baking", "Sweet"],
  },
  {
    id: "4",
    title: "Beef Tacos",
    image: "/placeholder.svg?height=300&width=400",
    spiceLevel: 4,
    cookTime: "30-35 minutes",
    tags: ["Mexican", "Spicy", "Meat"],
  },
  {
    id: "5",
    title: "Vegetarian Pizza",
    image: "/placeholder.svg?height=300&width=400",
    spiceLevel: 1,
    cookTime: "40-60 minutes",
    tags: ["Italian", "Vegetarian", "Baking"],
  },
  {
    id: "6",
    title: "Chicken Curry",
    image: "/placeholder.svg?height=300&width=400",
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
                  src={recipe.image || "/placeholder.svg"}
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
