"use client"

const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='42' r='22' fill='%23d1d5db'/%3E%3Cpath d='M22 88c0-16 12-28 28-28s28 12 28 28' fill='%23d1d5db'/%3E%3C/svg%3E"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Search, Heart, MessageCircle, Bookmark, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MealPlannerCalendar } from "@/components/meal-planner/calendar"
// Import the FriendSearch component
import { FriendSearch } from "@/components/friend-search"
// Import the UserProfileView component and add state for viewing profile
import { UserProfileView, type UserProfileData } from "@/components/user-profile-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock recipe data
const MOCK_RECIPES: any[] = [] // favorites populate once recipe data lands

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Add this to the component, after the state variables:
  const [viewingProfile, setViewingProfile] = useState<UserProfileData | null>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <ChefHat className="h-8 w-8 animate-bounce text-rose-500" />
          <p className="text-muted-foreground">Loading your cooking dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate XP progress to next level
  const xpForCurrentLevel = (user.level - 1) * 100
  const xpForNextLevel = user.level * 100
  const xpProgress = ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  // Get favorite recipes
  const favoriteRecipes = MOCK_RECIPES.filter((recipe) => user.favorites.includes(recipe.id))

  // Mock data for dashboard
  const recentRecipes = [
    {
      id: "1",
      name: "Spaghetti with Meatballs",
      image: PH,
      lastCooked: "2 days ago",
    },
    { id: "2", name: "Vegetable Stir Fry", image: PH, lastCooked: "1 week ago" },
    {
      id: "3",
      name: "Chocolate Chip Cookies",
      image: PH,
      lastCooked: "3 weeks ago",
    },
  ]

  const badges =
    user.badges.length > 0
      ? [
          {
            id: "pasta-master",
            name: "Pasta Master",
            image: PH,
            description: "Cooked 10 pasta dishes",
          },
          {
            id: "sweet-tooth",
            name: "Sweet Tooth",
            image: PH,
            description: "Baked 5 desserts",
          },
        ]
      : []

  const friends =
    user.friends.length > 0
      ? [
          { id: "friend1", name: "Jane Smith", image: PH, level: 5 },
          { id: "friend2", name: "Mike Johnson", image: PH, level: 7 },
          { id: "friend3", name: "Sarah Williams", image: PH, level: 4 },
        ]
      : []

  // Add openProfile function inside the component before return:
  const openProfile = (userId: string) => {
    // In a real app, this would fetch the user's profile data
    // For now, we'll use mock data
    const mockUserData: UserProfileData = {
      id: userId,
      name: friends.find((f) => f.id === userId)?.name || "User",
      level: friends.find((f) => f.id === userId)?.level || 1,
      xp: 150,
      mascot: userId === "friend1" ? "cat" : userId === "friend2" ? "dog" : "fox",
      createdAt: "January 2023",
      isFollowing: true,
      recipesCooked: 15,
      badges: ["1", "2", "3"],
      displayedBadges: ["1", "2"],
    }

    setViewingProfile(mockUserData)
    setProfileDialogOpen(true)
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Ready to continue your cooking adventure?</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/recipes">
              <Search className="mr-2 h-4 w-4" /> Find Recipes
            </Link>
          </Button>
          <Button asChild className="bg-rose-500 hover:bg-rose-600">
            <Link href="/profile">
              <ChefHat className="mr-2 h-4 w-4" /> My Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-background border-rose-100 dark:border-rose-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Level {user.level}</CardTitle>
            <CardDescription>
              {user.xp}/{xpForNextLevel} XP to Level {user.level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={xpProgress} className="h-2 bg-rose-100 dark:bg-rose-900/20">
              <div className="h-full bg-rose-500" style={{ width: `${xpProgress}%` }} />
            </Progress>
            <p className="text-sm text-muted-foreground mt-2">Cook more recipes to earn XP and level up!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recipes Unlocked</CardTitle>
            <CardDescription>{user.level * 5}/50 recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={((user.level * 5) / 50) * 100} className="h-2 bg-amber-100 dark:bg-amber-900/20">
              <div className="h-full bg-amber-500" style={{ width: `${((user.level * 5) / 50) * 100}%` }} />
            </Progress>
            <p className="text-sm text-muted-foreground mt-2">Level up to unlock more recipes!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-100 dark:border-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Badges Earned</CardTitle>
            <CardDescription>{badges.length}/20 badges</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(badges.length / 20) * 100} className="h-2 bg-emerald-100 dark:bg-emerald-900/20">
              <div className="h-full bg-emerald-500" style={{ width: `${(badges.length / 20) * 100}%` }} />
            </Progress>
            <p className="text-sm text-muted-foreground mt-2">Complete challenges to earn more badges!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8 bg-muted/60">
          <TabsTrigger value="recipes">Recent Recipes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="meal-planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recently Cooked</h2>
            {user.level > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/activity">View More Activity</Link>
              </Button>
            )}
          </div>

          {user.level > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRecipes.map((recipe) => (
                <div key={recipe.id} className="flex items-center p-4 border rounded-lg bg-card">
                  <img
                    src={PH}
                    alt={recipe.name}
                    className="w-16 h-16 rounded-md object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{recipe.name}</h3>
                    <p className="text-sm text-muted-foreground">Last cooked: {recipe.lastCooked}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">
                        Cook Again
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-500">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Let's Get Cooking!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                You haven't cooked any recipes yet. Start your culinary journey by trying out one of our delicious
                recipes!
              </p>
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/recipes">Start Cooking</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">My Favorite Recipes</h2>
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map((recipe) => (
                <div key={recipe.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                  <span className="font-medium">{recipe.title}</span>
                  <span className="text-muted-foreground text-sm">{recipe.cookTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No favorite recipes yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                You haven't added any recipes to your favorites yet. Browse recipes and click the heart icon to add them
                here.
              </p>
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="meal-planner" className="space-y-4">
          <MealPlannerCalendar />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">My Badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center p-4 border rounded-lg text-center bg-card">
                  <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mb-2">
                    <img src={PH} alt={badge.name} className="w-12 h-12" />
                  </div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No badges yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                You haven't earned any badges yet. Complete cooking challenges to earn badges and show off your skills!
              </p>
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/recipes">Start Cooking</Link>
              </Button>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link href="/badges">View All Badges</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Update the friends tab content */}
        <TabsContent value="friends" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Cooking Friends</h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
              <CardDescription>Connect with other cooking enthusiasts</CardDescription>
            </CardHeader>
            <CardContent>
              <FriendSearch />
            </CardContent>
          </Card>

          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center p-4 border rounded-lg bg-card">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mr-4">
                    <img
                      src={PH}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{friend.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-rose-500">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openProfile(friend.id)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No friends yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                You haven't connected with any cooking friends yet. Use the search above to find other chefs to share
                recipes and cooking tips!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* User Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {viewingProfile && <UserProfileView userData={viewingProfile} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
