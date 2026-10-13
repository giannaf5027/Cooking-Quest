"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Clock, ChefHat, ArrowLeft, Heart, Share2, Award, CheckCircle2 } from "lucide-react"
import GameSelector from "@/components/games/GameSelector"
import { useAuth } from "@/lib/auth-context"
import { AddToMealPlan } from "@/components/add-to-meal-plan"

// Mock recipe data - in a real app, this would be fetched from an API
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Spaghetti with Meatballs",
    image: "/placeholder.svg?height=500&width=800",
    spiceLevel: 2,
    cookTime: "30-35 minutes",
    difficulty: "Medium",
    servings: 4,
    tags: ["Italian", "Pasta", "Meat"],
    description:
      "A classic Italian-American dish with tender meatballs and al dente spaghetti, all covered in a rich tomato sauce. Perfect for a family dinner!",
    ingredients: [
      "1 pound ground beef",
      "1/2 cup breadcrumbs",
      "1/4 cup grated Parmesan cheese",
      "2 cloves garlic, minced",
      "1 egg",
      "1 teaspoon dried oregano",
      "1/2 teaspoon salt",
      "1/4 teaspoon black pepper",
      "2 tablespoons olive oil",
      "1 onion, finely chopped",
      "2 cans (14.5 oz each) crushed tomatoes",
      "1 teaspoon sugar",
      "1 pound spaghetti",
      "Fresh basil leaves for garnish",
      "Additional Parmesan cheese for serving",
    ],
    steps: [
      {
        title: "Prepare the Meatballs",
        description:
          "In a large bowl, combine ground beef, breadcrumbs, Parmesan, garlic, egg, oregano, salt, and pepper. Mix gently with your hands until just combined. Form into 1-inch meatballs.",
        gameType: "none",
        timer: null,
        image: "/placeholder.svg?height=300&width=400&text=Step+1",
      },
      {
        title: "Chop the Ingredients",
        description: "Finely chop the onion and mince the garlic cloves.",
        gameType: "chop",
        emoji: "🧅",
        timer: null,
        image: "/placeholder.svg?height=300&width=400&text=Step+2",
      },
      {
        title: "Cook the Meatballs",
        description:
          "Heat olive oil in a large skillet over medium heat. Add meatballs and cook, turning occasionally, until browned on all sides, about 8-10 minutes.",
        gameType: "flip",
        emoji: "🍖",
        timer: 10 * 60, // 10 minutes in seconds
        image: "/placeholder.svg?height=300&width=400&text=Step+3",
      },
      {
        title: "Make the Sauce",
        description:
          "Add chopped onion to the skillet and cook until softened, about 5 minutes. Add crushed tomatoes and sugar. Bring to a simmer.",
        gameType: "pour",
        emoji: "🍅",
        liquidColor: "#e53e3e",
        timer: 5 * 60, // 5 minutes in seconds
        image: "/placeholder.svg?height=300&width=400&text=Step+4",
      },
      {
        title: "Simmer",
        description: "Return meatballs to the sauce. Reduce heat to low and simmer, covered, for 15-20 minutes.",
        gameType: "none",
        timer: 20 * 60, // 20 minutes in seconds
        image: "/placeholder.svg?height=300&width=400&text=Step+5",
      },
      {
        title: "Cook the Pasta",
        description:
          "Meanwhile, cook spaghetti in a large pot of salted boiling water according to package directions until al dente. Drain.",
        gameType: "none",
        timer: 10 * 60, // 10 minutes in seconds
        image: "/placeholder.svg?height=300&width=400&text=Step+6",
      },
      {
        title: "Serve",
        description:
          "Serve spaghetti topped with meatballs and sauce. Garnish with fresh basil and additional Parmesan cheese.",
        gameType: "none",
        timer: null,
        image: "/placeholder.svg?height=300&width=400&text=Step+7",
      },
    ],
    nutrition: {
      calories: 650,
      protein: 35,
      carbs: 80,
      fat: 22,
      fiber: 5,
      sugar: 8,
    },
    tips: [
      "For juicier meatballs, use a mixture of ground beef, pork, and veal.",
      "Don't overmix the meatball mixture, or they'll become tough.",
      "For a spicier sauce, add red pepper flakes to taste.",
      "The sauce can be made ahead and stored in the refrigerator for up to 3 days.",
    ],
    reviews: [
      {
        user: "CookingEnthusiast",
        rating: 5,
        comment: "Absolutely delicious! The meatballs were so tender and flavorful.",
      },
      {
        user: "PastaLover",
        rating: 4,
        comment: "Great recipe! I added some red wine to the sauce for extra depth.",
      },
      {
        user: "BeginnerChef",
        rating: 5,
        comment: "Easy to follow instructions and turned out perfect!",
      },
    ],
    xpReward: 50,
  },
  // Add more recipes as needed
]

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, toggleFavorite, isFavorite } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [liked, setLiked] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  // Find the recipe based on the ID from the URL
  const recipe = MOCK_RECIPES.find((r) => r.id === params.id)

  // If recipe not found, redirect to recipes page
  useEffect(() => {
    if (!recipe) {
      router.push("/recipes")
    }

    // Set initial liked state based on user favorites
    if (user && recipe) {
      setLiked(isFavorite(recipe.id))
    }
  }, [recipe, router, user, isFavorite])

  if (!recipe) {
    return null
  }

  // Calculate average rating
  const averageRating = recipe.reviews.reduce((acc, review) => acc + review.rating, 0) / recipe.reviews.length

  // Handle step completion
  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps((prev) => [...prev, stepIndex])
    }
  }

  // Handle game completion
  const handleGameComplete = () => {
    handleStepComplete(currentStep)
  }

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (user) {
      toggleFavorite(recipe.id)
      setLiked(!liked)
    } else {
      router.push("/login")
    }
  }

  // Current step data
  const currentStepData = recipe.steps[currentStep]

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      {/* Back Button */}
      <div className="mb-4">
        <Button asChild variant="ghost" className="gap-1 pl-0 hover:pl-2 transition-all">
          <Link href="/recipes">
            <ArrowLeft className="w-4 h-4" />
            Back to Recipes
          </Link>
        </Button>
      </div>

      {/* Recipe Header */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg">
          <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="object-cover w-full h-full" />
        </div>

        <div className="flex flex-col">
          <h1 className="mb-2 text-3xl font-bold">{recipe.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-rose-500">{recipe.difficulty}</Badge>
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="mb-4 text-muted-foreground">{recipe.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{recipe.cookTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium">Servings</p>
                <p className="text-sm text-muted-foreground">{recipe.servings}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Flame
                    key={i}
                    className={`h-4 w-4 ${i < recipe.spiceLevel ? "text-red-500 fill-red-500" : "text-gray-300 dark:text-gray-600"}`}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">Spice Level</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {user ? (
              <>
                <Button asChild className="gap-2 bg-rose-500 hover:bg-rose-600">
                  <Link href={`/recipes/${recipe.id}/virtual`}>
                    <ChefHat className="w-4 h-4" />
                    Cook Virtually
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href={`/recipes/${recipe.id}/real-life`}>
                    <ChefHat className="w-4 h-4" />
                    Cook in Real Life
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={liked ? "text-rose-500" : ""}
                  onClick={handleFavoriteToggle}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
                <AddToMealPlan recipeId={recipe.id} recipeTitle={recipe.title} recipeImage={recipe.image} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="icon">
                  <Link href="/login">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {!user ? (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">Sign in to cook this recipe!</h3>
          <p className="text-muted-foreground mb-4">
            Create an account or sign in to cook this recipe, earn XP, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Recipe Content */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-4 md:w-auto md:inline-flex bg-muted/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-rose-100 dark:border-rose-900/20">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
                <CardTitle>About This Recipe</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-muted-foreground">{recipe.description}</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Nutrition Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.fiber}g</p>
                        <p className="text-xs text-muted-foreground">Fiber</p>
                      </div>
                      <div className="p-3 text-center bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-lg font-bold text-rose-600">{recipe.nutrition.sugar}g</p>
                        <p className="text-xs text-muted-foreground">Sugar</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Chef's Tips</h3>
                    <ul className="pl-5 space-y-2 list-disc">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="text-muted-foreground">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 dark:border-amber-900/20">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
                <CardTitle>Cooking Experience</CardTitle>
                <CardDescription>Earn XP and badges by cooking this recipe</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <ChefHat className="w-6 h-6 text-amber-500" />
                      <h3 className="text-lg font-medium">Experience Points</h3>
                    </div>
                    <p className="mb-4 text-muted-foreground">
                      Cook this recipe to earn <span className="font-bold text-amber-600">{recipe.xpReward} XP</span>{" "}
                      towards your next level!
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button asChild className="gap-2 bg-amber-500 hover:bg-amber-600">
                        <Link href={`/recipes/${recipe.id}/virtual`}>
                          <ChefHat className="w-4 h-4" />
                          Virtual: {recipe.xpReward / 2} XP
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="gap-2 border-amber-200 dark:border-amber-800">
                        <Link href={`/recipes/${recipe.id}/real-life`}>
                          <ChefHat className="w-4 h-4" />
                          Real Life: {recipe.xpReward} XP
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-emerald-500" />
                      <h3 className="text-lg font-medium">Unlockable Badges</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                          <img src="/placeholder.svg?height=24&width=24" alt="Pasta Master" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pasta Master</p>
                          <p className="text-xs text-muted-foreground">Cook 5 pasta recipes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                          <img src="/placeholder.svg?height=24&width=24" alt="Italian Chef" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Italian Chef</p>
                          <p className="text-xs text-muted-foreground">Cook 10 Italian dishes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <Card className="border-rose-100 dark:border-rose-900/20">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>For {recipe.servings} servings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 border border-rose-200 dark:border-rose-800 rounded-full"></div>
                      <span className="text-muted-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Shopping List
                  </Button>
                  <Button className="gap-2 bg-rose-500 hover:bg-rose-600">Print Ingredients</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <Card className="border-rose-100 dark:border-rose-900/20">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
                <CardTitle>Cooking Instructions</CardTitle>
                <CardDescription>Follow these steps to prepare {recipe.title}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Progress</h3>
                  <Progress
                    value={(completedSteps.length / recipe.steps.length) * 100}
                    className="h-2 bg-rose-100 dark:bg-rose-900/20"
                  >
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(completedSteps.length / recipe.steps.length) * 100}%` }}
                    />
                  </Progress>
                  <p className="text-sm text-muted-foreground mt-2">
                    {completedSteps.length} of {recipe.steps.length} steps completed
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Steps Navigation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Steps</h3>
                    {recipe.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentStep === index
                            ? "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                            : completedSteps.includes(index)
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                              : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex items-center justify-center w-6 h-6 mt-0.5 rounded-full shrink-0 ${
                              completedSteps.includes(index)
                                ? "bg-green-500 text-white"
                                : currentStep === index
                                  ? "bg-rose-500 text-white"
                                  : "bg-muted-foreground/20"
                            }`}
                          >
                            {completedSteps.includes(index) ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Step Details */}
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <img
                        src={currentStepData.image || "/placeholder.svg"}
                        alt={currentStepData.title}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <h3 className="text-xl font-medium">{currentStepData.title}</h3>
                    <p className="text-muted-foreground">{currentStepData.description}</p>

                    {/* Game Component */}
                    {currentStepData.gameType !== "none" && (
                      <GameSelector
                        gameType={currentStepData.gameType}
                        onComplete={handleGameComplete}
                        emoji={currentStepData.emoji}
                        liquidColor={currentStepData.liquidColor}
                      />
                    )}

                    {/* Timer */}
                    {currentStepData.timer && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-rose-500" />
                            <span className="font-medium">Timer</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This step takes approximately {Math.floor(currentStepData.timer / 60)} minutes.
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                      >
                        Previous Step
                      </Button>

                      {completedSteps.includes(currentStep) ? (
                        <Button
                          className="bg-rose-500 hover:bg-rose-600"
                          disabled={currentStep === recipe.steps.length - 1}
                          onClick={() => setCurrentStep((prev) => Math.min(recipe.steps.length - 1, prev + 1))}
                        >
                          Next Step
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => handleStepComplete(currentStep)}>
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-rose-100 dark:border-rose-900/20">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reviews</CardTitle>
                    <CardDescription>
                      {recipe.reviews.length} reviews • {averageRating.toFixed(1)} average rating
                    </CardDescription>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 text-yellow-400 ${i < Math.round(averageRating) ? "fill-current" : ""}`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recipe.reviews.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 overflow-hidden bg-rose-100 dark:bg-rose-900/20 rounded-full">
                            <span className="flex items-center justify-center w-full h-full text-sm font-medium text-rose-700 dark:text-rose-300">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{review.user}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 text-yellow-400 ${i < review.rating ? "fill-current" : ""}`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" className="gap-2">
                    Write a Review
                  </Button>
                  <Button className="gap-2 bg-rose-500 hover:bg-rose-600">See All Reviews</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
