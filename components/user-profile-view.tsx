"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BadgeDisplay } from "@/components/badge-display"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, MessageCircle, UserPlus, Check } from "lucide-react"
import { useState } from "react"

// Mock badge data
const MOCK_BADGES = [
  {
    id: "1",
    name: "Pasta Master",
    image: "/placeholder.svg?height=60&width=60",
    description: "Cooked 10 pasta dishes",
    unlocked: true,
  },
  {
    id: "2",
    name: "Sweet Tooth",
    image: "/placeholder.svg?height=60&width=60",
    description: "Baked 5 desserts",
    unlocked: true,
  },
  {
    id: "3",
    name: "Quick Chef",
    image: "/placeholder.svg?height=60&width=60",
    description: "Completed 3 recipes under 20 minutes",
    unlocked: true,
  },
  {
    id: "4",
    name: "Spice Warrior",
    image: "/placeholder.svg?height=60&width=60",
    description: "Cooked 5 spicy dishes",
    unlocked: true,
  },
  {
    id: "5",
    name: "Healthy Eater",
    image: "/placeholder.svg?height=60&width=60",
    description: "Cooked 10 vegetarian meals",
    unlocked: true,
  },
]

// Mock user data
export type UserProfileData = {
  id: string
  name: string
  level: number
  xp: number
  mascot: string
  createdAt: string
  isFollowing?: boolean
  recipesCooked: number
  badges: string[]
  displayedBadges: string[]
}

// Get emoji for mascot
function getMascotEmoji(mascot: string): string {
  switch (mascot) {
    case "chef":
      return "👨‍🍳"
    case "cat":
      return "🐱"
    case "dog":
      return "🐶"
    case "fox":
      return "🦊"
    case "panda":
      return "🐼"
    case "penguin":
      return "🐧"
    default:
      return "👨‍🍳"
  }
}

export function UserProfileView({ userData }: { userData: UserProfileData }) {
  const [isFollowing, setIsFollowing] = useState(userData.isFollowing || false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)

  // Filtered badges based on user's displayed badges
  const userBadges = MOCK_BADGES.filter((badge) => userData.badges.includes(badge.id))

  // Handle follow request
  const handleFollowRequest = () => {
    if (isFollowing) return

    setIsSendingRequest(true)
    // Simulate API call
    setTimeout(() => {
      setIsFollowing(true)
      setIsSendingRequest(false)
    }, 1000)
  }

  // Calculate XP progress to next level
  const xpForCurrentLevel = userData.level * 100
  const xpForNextLevel = (userData.level + 1) * 100
  const xpProgress = ((userData.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={""} alt={userData.name} />
                  <AvatarFallback className="text-lg bg-rose-100 dark:bg-rose-900/20">
                    {getMascotEmoji(userData.mascot)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-xl">{userData.name}</CardTitle>
                <CardDescription>Member since {userData.createdAt}</CardDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>

              <Button
                variant={isFollowing ? "secondary" : "default"}
                size="sm"
                disabled={isSendingRequest}
                onClick={handleFollowRequest}
                className={isFollowing ? "" : "bg-rose-500 hover:bg-rose-600"}
              >
                {isFollowing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Following
                  </>
                ) : isSendingRequest ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin">↻</span>
                    Requesting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="font-medium">Level {userData.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {userData.xp}/{xpForNextLevel} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2">
              <div className="h-full bg-rose-500" style={{ width: `${xpProgress}%` }} />
            </Progress>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl font-bold">{userData.level}</span>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl font-bold">{userData.recipesCooked}</span>
                <p className="text-sm text-muted-foreground">Recipes Cooked</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl font-bold">{userData.badges.length}</span>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="font-medium mb-2">Badges</h3>
              <BadgeDisplay badges={userBadges} maxDisplay={5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
