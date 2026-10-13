"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RecipeSearchList } from "@/components/meal-planner/recipe-search"

export type MealPlan = {
  date: Date
  meals: {
    id: string
    title: string
    image: string
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  }[]
}

export function MealPlannerCalendar() {
  const { user, updateMealPlan, getMealPlan } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("dinner")

  // Get the start of the week (Sunday)
  const startDate = startOfWeek(currentDate)

  // Generate the week days
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startDate, index)
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: isSameDay(date, new Date()),
    }
  })

  // Get meal plan for the selected date
  const getMealsForDate = (date: Date) => {
    if (!user) return []
    const mealPlan = getMealPlan(date)
    return mealPlan?.meals || []
  }

  // Navigate to previous week
  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7))
  }

  // Navigate to next week
  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7))
  }

  // Add a recipe to the meal plan
  const addToMealPlan = (recipeId: string, recipeTitle: string, recipeImage: string) => {
    if (!selectedDate || !user) return

    const meal = {
      id: recipeId,
      title: recipeTitle,
      image: recipeImage,
      mealType: selectedMealType,
    }

    updateMealPlan(selectedDate, meal)
    setSelectedDate(null)
  }

  // Remove a meal from the plan
  const removeMeal = (date: Date, mealId: string) => {
    if (!user) return
    updateMealPlan(date, null, mealId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meal Planner</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(startDate, "MMM d")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.date.toISOString()} className="space-y-2">
            <div
              className={`text-center p-2 rounded-lg ${
                day.isToday ? "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300" : "bg-muted"
              }`}
            >
              <div className="text-xs font-medium">{day.dayName}</div>
              <div className="text-lg font-bold">{day.dayNumber}</div>
            </div>

            <Card className="min-h-[200px]">
              <CardContent className="p-2 h-full">
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2">
                    {getMealsForDate(day.date).map((meal) => (
                      <div
                        key={meal.id}
                        className={`relative group p-1 rounded-md border bg-card text-xs ${
                          meal.mealType === "breakfast"
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                            : meal.mealType === "lunch"
                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                              : meal.mealType === "dinner"
                                ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20"
                                : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                        }`}
                      >
                        <div className="absolute -top-1 -right-1 hidden group-hover:flex">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-4 w-4 rounded-full"
                            onClick={() => removeMeal(day.date, meal.id)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground capitalize">{meal.mealType}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                            <img
                              src={meal.image || "/placeholder.svg"}
                              alt={meal.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="truncate font-medium">{meal.title}</div>
                        </div>
                      </div>
                    ))}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Meal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add a meal for {format(day.date, "EEEE, MMMM d")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex justify-center space-x-2">
                            {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                              <Button
                                key={type}
                                variant={selectedMealType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMealType(type)}
                                className="capitalize"
                              >
                                {type}
                              </Button>
                            ))}
                          </div>
                          <RecipeSearchList onSelectRecipe={addToMealPlan} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
