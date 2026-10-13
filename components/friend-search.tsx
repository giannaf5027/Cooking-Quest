"use client"

import { useState } from "react"
import { Search, UserPlus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

// Mock user data
const MOCK_USERS = [
  { id: "user1", name: "Jane Smith", image: "/placeholder.svg?height=40&width=40", level: 5 },
  { id: "user2", name: "Mike Johnson", image: "/placeholder.svg?height=40&width=40", level: 7 },
  { id: "user3", name: "Sarah Williams", image: "/placeholder.svg?height=40&width=40", level: 4 },
  { id: "user4", name: "Alex Chen", image: "/placeholder.svg?height=40&width=40", level: 9 },
  { id: "user5", name: "Taylor Brown", image: "/placeholder.svg?height=40&width=40", level: 3 },
  { id: "user6", name: "Jordan Lee", image: "/placeholder.svg?height=40&width=40", level: 6 },
  { id: "user7", name: "Casey Morgan", image: "/placeholder.svg?height=40&width=40", level: 8 },
  { id: "user8", name: "Riley Garcia", image: "/placeholder.svg?height=40&width=40", level: 2 },
]

export function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingFriends, setPendingFriends] = useState<string[]>([])
  const { user } = useAuth()

  // Filter users based on search query
  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user?.friends.includes(u.id) &&
      !pendingFriends.includes(u.id),
  )

  // Send friend request
  const sendFriendRequest = (userId: string) => {
    setPendingFriends([...pendingFriends, userId])
    // In a real app, this would send a request to the server
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
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={user.image || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => sendFriendRequest(user.id)}>
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

        {pendingFriends.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Pending Friend Requests</h3>
            <div className="space-y-2">
              {MOCK_USERS.filter((u) => pendingFriends.includes(u.id)).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Level {user.level}</p>
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
