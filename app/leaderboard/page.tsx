"use client"

// top chef leaderboard (KAN-8) - ranked by total xp

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, ChefHat } from "lucide-react"

export default function LeaderboardPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [entries, setEntries] = useState<any[]>([])

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
            return
        }
        if (!user) return

        const loadLeaderboard = async () => {
            const res = await fetch("/api/leaderboard")
            const data = await res.json()
            setEntries(data)
        }
        loadLeaderboard()
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-2">
                    <ChefHat className="h-8 w-8 animate-bounce text-rose-500" />
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8 px-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-7 w-7 text-amber-500" />
                <h1 className="text-3xl font-bold tracking-tight">Top Chefs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Ranked by XP</CardTitle>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 && <p className="text-muted-foreground">No chefs on the board yet.</p>}
                    <div className="space-y-2">
                        {entries.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    entry.id === user.id ? "bg-rose-100 dark:bg-rose-900/20" : "bg-muted/30"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>
                                    <span className="font-medium">{entry.name || "Unnamed Chef"}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{entry.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
