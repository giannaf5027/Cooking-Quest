import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Utensils, Trophy, Clock, Heart, Flame } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Cook, Play, Learn with <span className="text-rose-500">CookMama</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Master real recipes by playing fun cooking games. Level up your profile and unlock new dishes to cook in
                real life! Level up your profile and unlock new dishes to cook in real life!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/signup">
                  Start Cooking <Utensils className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn More <ChefHat className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-3">
                <ChefHat className="h-6 w-6 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Virtual Cooking</h3>
                <p className="text-muted-foreground">
                  Play fun cooking games that mimic real-life cooking steps and earn experience points.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-3">
                <Trophy className="h-6 w-6 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Unlock Recipes</h3>
                <p className="text-muted-foreground">
                  Level up your profile to unlock new recipes and earn badges to showcase your cooking skills.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-3">
                <Clock className="h-6 w-6 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Real-Life Cooking</h3>
                <p className="text-muted-foreground">
                  Follow step-by-step instructions with timers to cook the recipes in real life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Recipes</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Discover some of our most popular recipes that you can unlock and cook.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Recipe Cards */}
            <RecipeCard
              title="Spaghetti with Meatballs"
              image="/placeholder.svg?height=300&width=400&text=Spaghetti"
              spiceLevel={2}
              cookTime="30-35 minutes"
              tags={["Italian", "Pasta"]}
            />
            <RecipeCard
              title="Vegetable Stir Fry"
              image="/placeholder.svg?height=300&width=400&text=Stir+Fry"
              spiceLevel={3}
              cookTime="15-20 minutes"
              tags={["Vegetarian", "Asian", "Quick"]}
            />
            <RecipeCard
              title="Chocolate Chip Cookies"
              image="/placeholder.svg?height=300&width=400&text=Cookies"
              spiceLevel={0}
              cookTime="40-60 minutes"
              tags={["Dessert", "Baking"]}
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/recipes">
                View All Recipes <Heart className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Start Your Cooking Adventure?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Join CookMama today and start earning badges, unlocking recipes, and connecting with other food
                enthusiasts.
              </p>
            </div>
            <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Recipe Card Component
function RecipeCard({
  title,
  image,
  spiceLevel,
  cookTime,
  tags,
}: {
  title: string
  image: string
  spiceLevel: number
  cookTime: string
  tags: string[]
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Flame
                key={i}
                className={`h-4 w-4 ${i < spiceLevel ? "text-red-500 fill-red-500" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{cookTime}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button size="sm" variant="default" className="w-full">
            Virtual
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            IRL
          </Button>
          <Button size="sm" variant="secondary" className="w-full">
            Recipe
          </Button>
        </div>
      </div>
    </div>
  )
}
