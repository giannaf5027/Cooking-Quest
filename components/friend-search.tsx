"use client"

const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='42' r='22' fill='%23d1d5db'/%3E%3Cpath d='M22 88c0-16 12-28 28-28s28 12 28 28' fill='%23d1d5db'/%3E%3C/svg%3E"

import { useEffect, useState } from "react"
import { Search, UserPlus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// how much xp someone needs to reach their next level (each level is 100 xp)
function xpToNextLevel(xp: number) {
    return 100 - (xp % 100)
}

export function FriendSearch() {
    const [searchQuery, setSearchQuery] = useState("")
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [friendIds, setFriendIds] = useState<string[]>([])
    const [outgoingIds, setOutgoingIds] = useState<string[]>([])

    const loadData = async () => {
        const usersRes = await fetch("/api/users")
        setAllUsers(await usersRes.json())

        const friendsRes = await fetch("/api/friends")
        const friendsData = await friendsRes.json()
        setFriendIds(friendsData.friends.map((f: any) => f.id))
        setOutgoingIds(friendsData.outgoingIds)
    }

    useEffect(() => {
        loadData()
    }, [])

    // filter out people already friends with or already sent a request to
    const filteredUsers = allUsers.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !friendIds.includes(u.id) &&
            !outgoingIds.includes(u.id),
    )

    // send friend request
    const sendFriendRequest = async (userId: string) => {
        setOutgoingIds([...outgoingIds, userId])
        await fetch("/api/friends/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: userId }),
        })
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for friends by name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    <img src={PH} alt={u.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-muted-foreground">Level {u.level} · {xpToNextLevel(u.xp)} XP to next level</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => sendFriendRequest(u.id)}>
                                <UserPlus className="h-4 w-4" />
                                Add Friend
                            </Button>
                        </div>
                    ))
                ) : searchQuery ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
                    </div>
                ) : null}

                {outgoingIds.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Pending Friend Requests</h3>
                        <div className="space-y-2">
                            {allUsers
                                .filter((u) => outgoingIds.includes(u.id))
                                .map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img src={PH} alt={u.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-xs text-muted-foreground">Level {u.level} · {xpToNextLevel(u.xp)} XP to next level</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" disabled>
                                            <Check className="h-4 w-4" />
                                            Request Sent
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
