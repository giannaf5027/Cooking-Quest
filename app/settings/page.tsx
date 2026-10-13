"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChefHat, Music, Palette, Award, VolumeX, Volume2, Check, Lock } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

// Mock music tracks
const MUSIC_TRACKS = [
  { id: "1", title: "Relaxing Kitchen", src: "/music/relaxing-kitchen.mp3" },
  { id: "2", title: "Cooking Jazz", src: "/music/cooking-jazz.mp3" },
  { id: "3", title: "Italian Vibes", src: "/music/italian-vibes.mp3" },
  { id: "4", title: "Asian Fusion", src: "/music/asian-fusion.mp3" },
]

// Mock badge data
const MOCK_BADGES = [
  { id: "pasta-master", name: "Pasta Master", image: "/placeholder.svg?height=60&width=60", description: "Cooked 10 pasta dishes", unlocked: true },
  { id: "sweet-tooth", name: "Sweet Tooth", image: "/placeholder.svg?height=60&width=60", description: "Baked 5 desserts", unlocked: true },
  { id: "quick-chef", name: "Quick Chef", image: "/placeholder.svg?height=60&width=60", description: "Completed 3 recipes under 20 minutes", unlocked: true },
  { id: "spice-warrior", name: "Spice Warrior", image: "/placeholder.svg?height=60&width=60", description: "Cooked 5 spicy dishes", unlocked: true },
  { id: "healthy-eater", name: "Healthy Eater", image: "/placeholder.svg?height=60&width=60", description: "Cooked 10 vegetarian meals", unlocked: true },
  { id: "master-chef", name: "Master Chef", image: "/placeholder.svg?height=60&width=60", description: "Reached level 10", unlocked: false },
  { id: "social-butterfly", name: "Social Butterfly", image: "/placeholder.svg?height=60&width=60", description: "Connected with 10 friends", unlocked: false },
]

export default function SettingsPage() {
  const { user, isLoading, updateUserSettings } = useAuth()
  const router = useRouter()
  const [theme, setTheme] = useState<string>("default")
  const [cookingMusic, setCookingMusic] = useState<string>("1")
  const [displayedBadges, setDisplayedBadges] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("appearance")
  const [mascot, setMascot] = useState<string>("chef")
  const [timerSound, setTimerSound] = useState<string>("bell")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      setTheme(user.settings.theme)
      setCookingMusic(user.settings.cookingMusic)
      setDisplayedBadges(user.settings.displayedBadges)
      setTimerSound(user.settings.timerSound || "bell")
      setMascot(user.mascot || "chef")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <ChefHat className="h-8 w-8 animate-bounce text-rose-500" />
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    )
  }

  // Save settings
  const saveSettings = () => {
    setIsSaving(true)
    updateUserSettings({
      theme: theme as any,
      cookingMusic,
      displayedBadges,
      timerSound,
      mascot,
    })

    toast({
      title: "Settings saved!",
      description: "Your preferences have been updated successfully.",
    })

    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  // Toggle badge display
  const toggleBadge = (badgeId: string) => {
    if (displayedBadges.includes(badgeId)) {
      setDisplayedBadges(displayedBadges.filter((id) => id !== badgeId))
    } else {
      if (displayedBadges.length < 5) {
        setDisplayedBadges([...displayedBadges, badgeId])
      }
    }
  }

  // Get user's unlocked badges
  const unlockedBadges = MOCK_BADGES.filter((badge) => badge.unlocked)

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-1 pl-0 hover:pl-2 transition-all">
          <Link href="/dashboard">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Customize your CookMama experience</p>
        </div>
        <Button
          onClick={saveSettings}
          className={`bg-rose-500 hover:bg-rose-600 ${isSaving ? "animate-pulse" : ""}`}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 mb-8 bg-muted/60">
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="music">
            <Music className="mr-2 h-4 w-4" />
            Cooking Music
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="mr-2 h-4 w-4" />
            Profile Badges
          </TabsTrigger>
          <TabsTrigger value="mascot">
            <ChefHat className="mr-2 h-4 w-4" />
            Mascot
          </TabsTrigger>
          <TabsTrigger value="sounds">
            <Volume2 className="mr-2 h-4 w-4" />
            Timer Sounds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred color theme</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <RadioGroupItem value="default" id="theme-default" className="sr-only" />
                  <Label
                    htmlFor="theme-default"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      theme === "default" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-rose-500"></div>
                    <span>Default</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="rose" id="theme-rose" className="sr-only" />
                  <Label
                    htmlFor="theme-rose"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      theme === "rose" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-rose-400"></div>
                    <span>Rose</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="emerald" id="theme-emerald" className="sr-only" />
                  <Label
                    htmlFor="theme-emerald"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      theme === "emerald" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-500"></div>
                    <span>Emerald</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="amber" id="theme-amber" className="sr-only" />
                  <Label
                    htmlFor="theme-amber"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      theme === "amber" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-500"></div>
                    <span>Amber</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="sky" id="theme-sky" className="sr-only" />
                  <Label
                    htmlFor="theme-sky"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      theme === "sky" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-sky-500"></div>
                    <span>Sky</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cooking Music</CardTitle>
              <CardDescription>Choose your preferred background music for cooking</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={cookingMusic} onValueChange={setCookingMusic} className="space-y-2">
                {MUSIC_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                      cookingMusic === track.id
                        ? "border-2 border-primary bg-[hsl(var(--selected))] text-[hsl(var(--selected-foreground))]"
                        : "border border-transparent hover:bg-accent"
                    }`}
                    onClick={() => setCookingMusic(track.id)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") setCookingMusic(track.id)
                    }}
                    role="radio"
                    aria-checked={cookingMusic === track.id}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={track.id} id={`music-${track.id}`} className="pointer-events-none" />
                      <Label htmlFor={`music-${track.id}`} className="cursor-pointer">
                        {track.title}
                      </Label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Music className="h-4 w-4" />
                      <span className="sr-only">Preview</span>
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Badges</CardTitle>
              <CardDescription>Choose up to 5 badges to display on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Selected Badges ({displayedBadges.length}/5)</h3>
                  <div className="flex flex-wrap gap-4">
                    {displayedBadges.length > 0 ? (
                      unlockedBadges
                        .filter((badge) => displayedBadges.includes(badge.id))
                        .map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex flex-col items-center p-4 border rounded-lg text-center bg-card cursor-pointer hover:bg-accent ${
                              displayedBadges.includes(badge.id) ? "border-2 border-primary" : "border border-transparent"
                            }`}
                            onClick={() => toggleBadge(badge.id)}
                          >
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mb-2">
                              <img src={badge.image || "/placeholder.svg"} alt={badge.name} className="w-12 h-12" />
                            </div>
                            <h3 className="font-medium text-sm">{badge.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-muted-foreground">No badges selected. Click on badges below to select them.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Available Badges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {unlockedBadges
                      .filter((badge) => !displayedBadges.includes(badge.id))
                      .map((badge) => (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center p-4 border rounded-lg text-center bg-card cursor-pointer hover:bg-accent"
                          onClick={() => toggleBadge(badge.id)}
                        >
                          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mb-2">
                            <img src={badge.image || "/placeholder.svg"} alt={badge.name} className="w-12 h-12" />
                          </div>
                          <h3 className="font-medium text-sm">{badge.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mascot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Mascot</CardTitle>
              <CardDescription>Choose your CookMama mascot that appears on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={mascot} onValueChange={setMascot} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <RadioGroupItem value="chef" id="mascot-chef" className="sr-only" />
                  <Label
                    htmlFor="mascot-chef"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      mascot === "chef" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                      <span className="text-2xl">👨‍🍳</span>
                    </div>
                    <span>Chef</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cat" id="mascot-cat" className="sr-only" />
                  <Label
                    htmlFor="mascot-cat"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      mascot === "cat" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                      <span className="text-2xl">🐱</span>
                    </div>
                    <span>Cat</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dog" id="mascot-dog" className="sr-only" />
                  <Label
                    htmlFor="mascot-dog"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      mascot === "dog" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                      <span className="text-2xl">🐶</span>
                    </div>
                    <span>Dog</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="fox" id="mascot-fox" className="sr-only" />
                  <Label
                    htmlFor="mascot-fox"
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                      mascot === "fox" ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                      <span className="text-2xl">🦊</span>
                    </div>
                    <span>Fox</span>
                  </Label>
                </div>

                {user && user.level >= 2 ? (
                  <>
                    <div>
                      <RadioGroupItem value="panda" id="mascot-panda" className="sr-only" />
                      <Label
                        htmlFor="mascot-panda"
                        className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          mascot === "panda" ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                          <span className="text-2xl">🐼</span>
                        </div>
                        <span>Panda</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="penguin" id="mascot-penguin" className="sr-only" />
                      <Label
                        htmlFor="mascot-penguin"
                        className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          mascot === "penguin" ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                          <span className="text-2xl">🐧</span>
                        </div>
                        <span>Penguin</span>
                      </Label>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Lock className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="font-medium">More mascots</p>
                        <p className="text-xs text-muted-foreground">Reach level 2 to unlock more mascots!</p>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sounds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timer Sounds</CardTitle>
              <CardDescription>Choose the sound that plays when your cooking timer ends</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={timerSound} onValueChange={setTimerSound} className="space-y-2">
                <div
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    timerSound === "bell"
                      ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20"
                      : "border border-transparent hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="bell" id="sound-bell" />
                    <Label htmlFor="sound-bell" className="cursor-pointer">
                      Bell Sound
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      // In a real app, this would play a sound
                      alert("Bell sound would play here")
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Preview</span>
                  </Button>
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    timerSound === "alarm"
                      ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20"
                      : "border border-transparent hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="alarm" id="sound-alarm" />
                    <Label htmlFor="sound-alarm" className="cursor-pointer">
                      Alarm Sound
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      // In a real app, this would play a sound
                      alert("Alarm sound would play here")
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Preview</span>
                  </Button>
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    timerSound === "chime"
                      ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20"
                      : "border border-transparent hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="chime" id="sound-chime" />
                    <Label htmlFor="sound-chime" className="cursor-pointer">
                      Chime Sound
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      // In a real app, this would play a sound
                      alert("Chime sound would play here")
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Preview</span>
                  </Button>
                </div>

                {user && user.level >= 2 ? (
                  <>
                    <div
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        timerSound === "whistle"
                          ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20"
                          : "border border-transparent hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="whistle" id="sound-whistle" />
                        <Label htmlFor="sound-whistle" className="cursor-pointer">
                          Kitchen Whistle
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => {
                          // In a real app, this would play a sound
                          alert("Whistle sound would play here")
                        }}
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">Preview</span>
                      </Button>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        timerSound === "ding"
                          ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20"
                          : "border border-transparent hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="ding" id="sound-ding" />
                        <Label htmlFor="sound-ding" className="cursor-pointer">
                          Kitchen Ding
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => {
                          // In a real app, this would play a sound
                          alert("Ding sound would play here")
                        }}
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">Preview</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Lock className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="font-medium">More timer sounds</p>
                        <p className="text-xs text-muted-foreground">Reach level 2 to unlock more timer sounds!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    timerSound === "none" ? "border-2 border-primary bg-rose-50 dark:bg-rose-900/20" : "border border-transparent hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="none" id="sound-none" />
                    <Label htmlFor="sound-none" className="cursor-pointer">
                      No Sound
                    </Label>
                  </div>
                  <VolumeX className="h-4 w-4 mr-2 text-muted-foreground" />
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}