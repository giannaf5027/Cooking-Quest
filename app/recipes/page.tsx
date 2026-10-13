"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RecipeCard } from "@/components/recipe-card"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"

// Mock recipe data
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Spaghetti with Meatballs",
    image: "/placeholder.svg?height=300&width=400&text=Spaghetti",
    spiceLevel: 2,
    cookTime: "30-35 minutes",
    tags: ["Italian", "Pasta", "Meat"],
    ingredients: ["pasta", "tomato", "beef", "garlic", "onion"],
    difficulty: "medium",
  },
  {
    id: "2",
    title: "Vegetable Stir Fry",
    image: "/placeholder.svg?height=300&width=400&text=Stir+Fry",
    spiceLevel: 3,
    cookTime: "15-20 minutes",
    tags: ["Vegetarian", "Asian", "Quick"],
    ingredients: ["broccoli", "carrot", "pepper", "soy sauce", "rice"],
    difficulty: "easy",
  },
  {
    id: "3",
    title: "Chocolate Chip Cookies",
    image: "/placeholder.svg?height=300&width=400&text=Cookies",
    spiceLevel: 0,
    cookTime: "40-60 minutes",
    tags: ["Dessert", "Baking", "Sweet"],
    ingredients: ["flour", "sugar", "chocolate", "butter", "eggs"],
    difficulty: "easy",
  },
  {
    id: "4",
    title: "Beef Tacos",
    image: "/placeholder.svg?height=300&width=400&text=Tacos",
    spiceLevel: 4,
    cookTime: "30-35 minutes",
    tags: ["Mexican", "Spicy", "Meat"],
    ingredients: ["beef", "tortilla", "tomato", "lettuce", "cheese"],
    difficulty: "medium",
  },
  {
    id: "5",
    title: "Vegetarian Pizza",
    image: "/placeholder.svg?height=300&width=400&text=Pizza",
    spiceLevel: 1,
    cookTime: "40-60 minutes",
    tags: ["Italian", "Vegetarian", "Baking"],
    ingredients: ["dough", "tomato sauce", "cheese", "vegetables", "olive oil"],
    difficulty: "hard",
  },
  {
    id: "6",
    title: "Chicken Curry",
    image: "/placeholder.svg?height=300&width=400&text=Curry",
    spiceLevel: 5,
    cookTime: "40-60 minutes",
    tags: ["Indian", "Spicy", "Meat"],
    ingredients: ["chicken", "curry powder", "coconut milk", "rice", "onion"],
    difficulty: "medium",
  },
]

// Filter categories
const FILTER_CATEGORIES = [
  {
    id: "dietary",
    label: "Dietary Restrictions",
    options: [
      { id: "vegetarian", label: "Vegetarian" },
      { id: "vegan", label: "Vegan" },
      { id: "gluten-free", label: "Gluten Free" },
      { id: "dairy-free", label: "Dairy Free" },
      { id: "nut-free", label: "Nut Free" },
      { id: "egg-free", label: "Egg Free" },
    ],
  },
  {
    id: "meal-type",
    label: "Meal Type",
    options: [
      { id: "breakfast", label: "Breakfast" },
      { id: "lunch", label: "Lunch" },
      { id: "dinner", label: "Dinner" },
      { id: "dessert", label: "Dessert" },
      { id: "snack", label: "Snack" },
    ],
  },
  {
    id: "cuisine",
    label: "Cuisine",
    options: [
      { id: "italian", label: "Italian" },
      { id: "mexican", label: "Mexican" },
      { id: "asian", label: "Asian" },
      { id: "indian", label: "Indian" },
      { id: "american", label: "American" },
    ],
  },
  {
    id: "cookware",
    label: "Cookware",
    options: [
      { id: "air-fryer", label: "Air Fryer" },
      { id: "instant-pot", label: "Instant Pot" },
      { id: "grill", label: "Grill" },
      { id: "slow-cooker", label: "Slow Cooker" },
      { id: "oven", label: "Oven" },
      { id: "stovetop", label: "Stovetop" },
      { id: "blender", label: "Blender" },
      { id: "microwave", label: "Microwave" },
      { id: "toaster-oven", label: "Toaster Oven" },
      { id: "pressure-cooker", label: "Pressure Cooker" },
      ],
  },
  {
    id: "time",
    label: "Cooking Time",
    options: [
      { id: "quick", label: "5-10 minutes" },
      { id: "short", label: "15-20 minutes" },
      { id: "medium", label: "30-35 minutes" },
      { id: "long", label: "40-60 minutes" },
      { id: "very-long", label: "60+ minutes" },
    ],
  },
  {
    id: "difficulty",
    label: "Difficulty",
    options: [
      { id: "easy", label: "Easy" },
      { id: "medium", label: "Medium" },
      { id: "hard", label: "Hard" },
    ],
  },
]

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [spiceLevel, setSpiceLevel] = useState([0])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["dietary"])

  const { user } = useAuth()

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Filter recipes based on search query and filters
  const filteredRecipes = MOCK_RECIPES.filter((recipe) => {
    // Only show recipes that are available to the user based on level
    const isAvailable = user ? user.availableRecipes.includes(recipe.id) : true

    // Search by title or ingredients
    const matchesSearch =
      searchQuery === "" ||
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by spice level
    const matchesSpiceLevel = spiceLevel[0] === 0 ? true : recipe.spiceLevel === spiceLevel[0]

    // Filter by active filters (tags, dietary, etc.)
    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.some((filter) => recipe.tags.some((tag) => tag.toLowerCase() === filter.toLowerCase())) ||
      activeFilters.includes(recipe.difficulty)

    return isAvailable && matchesSearch && matchesSpiceLevel && matchesFilters
  })

  // Toggle a filter
  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
    setSpiceLevel([0])
    setSearchQuery("")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">Find and cook delicious recipes to level up your profile</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  Clear all
                  <X className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Spice Level Filter */}
              <Card>
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleCategory("spice")}
                  >
                    <h3 className="font-medium">Spice Level</h3>
                    {expandedCategories.includes("spice") ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {expandedCategories.includes("spice") && (
                    <div className="mt-4 px-2">
                      <div className="grid grid-cols-6 gap-1">
                        {[0, 1, 2, 3, 4, 5].map((level) => (
                          <Button
                            key={level}
                            variant={spiceLevel[0] === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSpiceLevel([level])}
                            className="w-full"
                          >
                            {level === 0 ? "All" : level}
                          </Button>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>All Levels</span>
                        <span>Very Spicy</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Filter Categories */}
              {FILTER_CATEGORIES.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <h3 className="font-medium">{category.label}</h3>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {expandedCategories.includes(category.id) && (
                      <div className="mt-4 space-y-2">
                        {category.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`desktop-${option.id}`}
                              checked={activeFilters.includes(option.id)}
                              onCheckedChange={() => toggleFilter(option.id)}
                            />
                            <label
                              htmlFor={`desktop-${option.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Mobile Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search recipes or ingredients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down recipes by your preferences</SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  {activeFilters.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mb-4">
                      Clear all filters
                      <X className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="spice-level">
                      <AccordionTrigger>Spice Level</AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2">
                          <div className="grid grid-cols-6 gap-1">
                            {[0, 1, 2, 3, 4, 5].map((level) => (
                              <Button
                                key={level}
                                variant={spiceLevel[0] === level ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSpiceLevel([level])}
                                className="w-full"
                              >
                                {level === 0 ? "All" : level}
                              </Button>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>All Levels</span>
                            <span>Very Spicy</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {FILTER_CATEGORIES.map((category) => (
                      <AccordionItem key={category.id} value={category.id}>
                        <AccordionTrigger>{category.label}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {category.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mobile-${option.id}`}
                                  checked={activeFilters.includes(option.id)}
                                  onCheckedChange={() => toggleFilter(option.id)}
                                />
                                <label
                                  htmlFor={`mobile-${option.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                <div className="mt-4">
                  <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter) => {
                // Find the label for this filter
                const allOptions = FILTER_CATEGORIES.flatMap((category) => category.options)
                const filterObj = allOptions.find((f) => f.id === filter)

                return (
                  <Button
                    key={filter}
                    variant="secondary"
                    size="sm"
                    className="h-7 rounded-full"
                    onClick={() => toggleFilter(filter)}
                  >
                    {filterObj?.label || filter}
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )
              })}
              <Button variant="ghost" size="sm" className="h-7 rounded-full" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? "Recipe" : "Recipes"} Found
              </h2>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    image={recipe.image}
                    spiceLevel={recipe.spiceLevel}
                    cookTime={recipe.cookTime}
                    tags={recipe.tags}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No recipes found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any recipes that match your search and filters. Try adjusting your search terms or
                  clearing some filters.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
          {user && user.level < 2 && (
            <div className="mt-6 p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
              <h3 className="text-lg font-medium mb-2">More recipes waiting for you!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Reach level 2 to unlock more delicious recipes. Keep cooking to earn XP!
              </p>
              <Progress
                value={(user.xp / 200) * 100}
                className="h-2 max-w-md mx-auto mb-2 bg-amber-100 dark:bg-amber-900/40"
              >
                <div className="h-full bg-amber-500" style={{ width: `${(user.xp / 200) * 100}%` }} />
              </Progress>
              <p className="text-sm text-muted-foreground">{user.xp}/200 XP to Level 2</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
