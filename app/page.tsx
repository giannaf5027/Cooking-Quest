"use client"

//
// Pre-login portal (Purab, 10/13/2026). Built on Gianna's landing page layout:
// hero, three feature cards, CTA. Signed-in users go to /dashboard.
//

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ChefHat, Utensils, Trophy, CalendarDays, Search } from "lucide-react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Signed-in users skip the portal
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard")
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Cook, Play, Learn with <span className="text-rose-500">Cooking Quest</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Learn to cook one step at a time. Finish real recipes to earn XP, level up, and unlock new dishes.
                We plan your week and write the grocery list, so all you have to do is cook.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/signup">
                  Start Cooking <Utensils className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free. No cooking experience needed. Built for middle school through college.</p>
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
                <h3 className="text-xl font-bold">Cook Step by Step</h3>
                <p className="text-muted-foreground">
                  Pick a recipe by difficulty or meal type and follow one instruction at a time, with timers and the
                  exact amounts you need.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-3">
                <Trophy className="h-6 w-6 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Level Up</h3>
                <p className="text-muted-foreground">
                  Every finished recipe earns XP. Level up to unlock harder dishes and badges like Thyme Turner and
                  Super Sage.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-3">
                <CalendarDays className="h-6 w-6 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Plan and Shop</h3>
                <p className="text-muted-foreground">
                  Drop recipes onto a weekly plan and the ingredients combine into one grocery list you can take to the
                  store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Start Your Cooking Quest?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Make an account, pick your first easy recipe, and have dinner on the table tonight.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/recipes">
                  Browse Recipes <Search className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
