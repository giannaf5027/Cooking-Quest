"use client"

//
// Created by Ethan on 10/07/2026.
//


import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isSameDay } from "date-fns"
import bcrypt from "bcryptjs";

// activity type
type Activity = {
    id: string
    type: "cooked" | "unlocked" | "levelup"
    date: string
    recipeId?: string
    recipeTitle?: string
    badgeId?: string
    badgeName?: string
    level?: number
    xp: number
}

// meal plan type
type MealPlan = {
    date: string // ISO string
    meals: {
        id: string
        title: string
        image: string
        mealType: "breakfast" | "lunch" | "dinner" | "snack"
    }[]
}

// user type
type User = {
    id: string
    name: string | null
    email: string
    image: string | null
    mascot: string // mascot is at the root
    level: number
    xp: number
    isAdmin?: boolean
    favorites: string[]
    badges: string[]
    friends: string[]
    mealPlans: MealPlan[]
    availableRecipes: string[]
    activities: Activity[]
    settings: {
        theme: string
        cookingMusic: string
        displayedBadges: string[]
        timerSound: string
    }
}

// user credentials type for storage
type UserCredential = {
    id: string
    name: string
    email: string
    password: string
    isAdmin?: boolean
}

// settings type for updateUserSettings
type UserSettings = {
    theme: string
    cookingMusic: string
    displayedBadges: string[]
    timerSound: string
    mascot: string // mascot included here for update
}

// auth context type
type AuthContextType = {
    user: User | null
    isLoading: boolean
    signIn: (usernameOrEmail: string, password: string) => Promise<void>
    signUp: (name: string, email: string, password: string) => Promise<void>
    signOut: () => void
    users: UserCredential[]
    toggleFavorite: (recipeId: string) => void
    isFavorite: (recipeId: string) => boolean
    addXp: (amount: number) => void
    updateMealPlan: (
        date: Date,
        meal: { id: string; title: string; image: string; mealType: string } | null,
        mealIdToRemove?: string,
    ) => void
    getMealPlan: (date: Date) => MealPlan | undefined
    updateUserSettings: (settings: UserSettings) => void
    recordActivity: (activity: Omit<Activity, "id" | "date">) => void
    requestPasswordReset: (email: string) => Promise<void>
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>
}

// create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// mock admin user
const ADMIN_USER: UserCredential = {
    id: "admin_123",
    name: "Admin",
    email: "admin@cookmama.com",
    password: "cook123",
    isAdmin: true,
}

// auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState<UserCredential[]>([ADMIN_USER])
    const router = useRouter()

    // check for existing session on mount
    useEffect(() => {
        const checkSession = () => {
            const storedUser = localStorage.getItem("cookmama_user")
            if (storedUser) {
                setUser(JSON.parse(storedUser))
            }

            const storedUsers = localStorage.getItem("cookmama_users")
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers)
                if (!parsedUsers.some((u: UserCredential) => u.id === ADMIN_USER.id)) {
                    parsedUsers.push(ADMIN_USER)
                }
                setUsers(parsedUsers)
            }
            else {
                localStorage.setItem("cookmama_users", JSON.stringify([ADMIN_USER]))
            }

            setIsLoading(false)
        }
        checkSession()
    }, [])

    // toggle favorite recipe
    const toggleFavorite = (recipeId: string) => {
        if (!user) return
        const updatedUser = { ...user }
        if (user.favorites.includes(recipeId)) {
            updatedUser.favorites = user.favorites.filter((id) => id !== recipeId)
        }
        else {
            updatedUser.favorites = [...user.favorites, recipeId]
        }
        setUser(updatedUser)
        localStorage.setItem("cookmama_user", JSON.stringify(updatedUser))
    }

    // check if recipe is favorited
    const isFavorite = (recipeId: string): boolean => {
        return user?.favorites?.includes(recipeId) || false
    }

    // add xp to user
    const addXp = (amount: number) => {
        if (!user) return
        const updatedUser = { ...user }
        updatedUser.xp += amount
        const currentLevel = user.level
        const newLevel = Math.floor(updatedUser.xp / 100) + 1
        if (newLevel > currentLevel) {
            updatedUser.level = newLevel
            if (newLevel === 2) {
                updatedUser.availableRecipes = [...updatedUser.availableRecipes, "4", "5"]
            }
            else if (newLevel === 3) {
                updatedUser.availableRecipes = [...updatedUser.availableRecipes, "6"]
            }
        }
        setUser(updatedUser)
        localStorage.setItem("cookmama_user", JSON.stringify(updatedUser))
    }

    // update meal plan
    const updateMealPlan = (
        date: Date,
        meal: { id: string; title: string; image: string; mealType: string } | null,
        mealIdToRemove?: string,
    ) => {
        if (!user) return
        const updatedUser = { ...user }
        const dateString = date.toISOString()
        const existingPlanIndex = updatedUser.mealPlans.findIndex((plan) => isSameDay(new Date(plan.date), date))
        if (existingPlanIndex >= 0) {
            if (meal) {
                updatedUser.mealPlans[existingPlanIndex].meals.push(meal as any)
            }
            if (mealIdToRemove) {
                updatedUser.mealPlans[existingPlanIndex].meals = updatedUser.mealPlans[existingPlanIndex].meals.filter(
                    (m) => m.id !== mealIdToRemove,
                )
            }
        }
        else if (meal) {
            updatedUser.mealPlans.push({
                date: dateString,
                meals: [meal as any],
            })
        }
        setUser(updatedUser)
        localStorage.setItem("cookmama_user", JSON.stringify(updatedUser))
    }

    // get meal plan for a specific date
    const getMealPlan = (date: Date) => {
        if (!user) return undefined
        return user.mealPlans.find((plan) => isSameDay(new Date(plan.date), date))
    }

    // sign in - hits the backend api first, falls back to local users so the mock admin still works
    const signIn = async (usernameOrEmail: string, password: string) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernameOrEmail, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Invalid credentials")

            const loggedInUser: User = {
                id: data.id,
                name: data.name,
                email: data.email,
                image: null,
                level: 1,
                xp: 0,
                favorites: [],
                badges: [],
                friends: [],
                mealPlans: [],
                availableRecipes: ["1", "2", "3"],
                mascot: "chef", // default mascot
                activities: [],
                settings: {
                    theme: "default",
                    cookingMusic: "1",
                    displayedBadges: [],
                    timerSound: "bell",
                },
            }
            setUser(loggedInUser)
            localStorage.setItem("cookmama_user", JSON.stringify(loggedInUser))
            router.push("/dashboard")
        } catch (error) {
            // fallback: local users array so the mock admin still works
            const userMatch = users.find(
                (u) => u.email === usernameOrEmail || u.name === usernameOrEmail
            )
            if (!userMatch) throw error
            const isValid = await bcrypt.compare(password, userMatch.password)
            if (!isValid) throw new Error("Invalid credentials")
            const loggedInUser: User = {
                id: userMatch.id,
                name: userMatch.name,
                email: userMatch.email,
                image: null,
                level: userMatch.isAdmin ? 2 : 1,
                xp: userMatch.isAdmin ? 150 : 0,
                isAdmin: userMatch.isAdmin,
                favorites: [],
                badges: userMatch.isAdmin ? ["admin", "master-chef", "pasta-master", "sweet-tooth"] : [],
                friends: [],
                mealPlans: [],
                availableRecipes: userMatch.isAdmin ? ["1", "2", "3", "4", "5"] : ["1", "2", "3"],
                mascot: "chef", // default mascot
                activities: userMatch.isAdmin
                    ? [
                            {
                                id: "act_1",
                                type: "levelup",
                                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                                level: 2,
                                xp: 0,
                            },
                        ]
                    : [],
                settings: {
                    theme: "default",
                    cookingMusic: "1",
                    displayedBadges: userMatch.isAdmin ? ["admin", "master-chef"] : [],
                    timerSound: "bell",
                },
            }
            setUser(loggedInUser)
            localStorage.setItem("cookmama_user", JSON.stringify(loggedInUser))
            router.push("/dashboard")
        } finally {
            setIsLoading(false)
        }
    }

    // sign up - hits the backend api first, falls back to local users if the backend is unreachable
    const signUp = async (name: string, email: string, password: string) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Signup failed")

            const newUser: User = {
                id: data.id,
                name: data.name,
                email: data.email,
                image: null,
                level: 1,
                xp: 0,
                favorites: [],
                badges: [],
                friends: [],
                mealPlans: [],
                availableRecipes: ["1", "2", "3"],
                mascot: "chef",
                activities: [],
                settings: {
                    theme: "default",
                    cookingMusic: "1",
                    displayedBadges: [],
                    timerSound: "bell",
                },
            }
            setUser(newUser)
            localStorage.setItem("cookmama_user", JSON.stringify(newUser))
            router.push("/dashboard")
        } catch (error) {
            // fallback: local users array so sign up still works
            if (users.some((u) => u.email === email)) throw error
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUserId = `user_${Date.now()}`
            const newUserCredential: UserCredential = {
                id: newUserId,
                name,
                email,
                password: hashedPassword,
            }
            const updatedUsers = [...users, newUserCredential]
            setUsers(updatedUsers)
            localStorage.setItem("cookmama_users", JSON.stringify(updatedUsers))
            const newUser: User = {
                id: newUserId,
                name,
                email,
                image: null,
                level: 1,
                xp: 0,
                favorites: [],
                badges: [],
                friends: [],
                mealPlans: [],
                availableRecipes: ["1", "2", "3"],
                mascot: "chef",
                activities: [],
                settings: {
                    theme: "default",
                    cookingMusic: "1",
                    displayedBadges: [],
                    timerSound: "bell",
                },
            }
            setUser(newUser)
            localStorage.setItem("cookmama_user", JSON.stringify(newUser))
            router.push("/dashboard")
        } finally {
            setIsLoading(false)
        }
    }

    // sign out
    const signOut = () => {
        setUser(null)
        localStorage.removeItem("cookmama_user")
        router.push("/")
    }

    // update user settings
    const updateUserSettings = (settings: UserSettings) => {
        if (!user) return
        const updatedUser: User = {
            ...user,
            mascot: settings.mascot, // update mascot at root
            settings: {
                ...user.settings,
                theme: settings.theme,
                cookingMusic: settings.cookingMusic,
                displayedBadges: settings.displayedBadges,
                timerSound: settings.timerSound,
            },
        }
        setUser(updatedUser)
        localStorage.setItem("cookmama_user", JSON.stringify(updatedUser))
    }

    // record user activity
    const recordActivity = (activity: Omit<Activity, "id" | "date">) => {
        if (!user) return
        const updatedUser = { ...user }
        const newActivity: Activity = {
            ...activity,
            id: `act_${Date.now()}`,
            date: new Date().toISOString(),
        }
        updatedUser.activities = [newActivity, ...updatedUser.activities]
        setUser(updatedUser)
        localStorage.setItem("cookmama_user", JSON.stringify(updatedUser))
        if (activity.xp > 0) {
            addXp(activity.xp)
        }
    }

    // request password reset connects to backend
    const requestPasswordReset = async (email: string) => {
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Reset link not sent")
    }

    // reset password connects to backend
    const resetPassword = async (email: string, token: string, newPassword: string) => {
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, newPassword }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Reset failed")
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signUp,
                signOut,
                users,
                toggleFavorite,
                isFavorite,
                addXp,
                updateMealPlan,
                getMealPlan,
                updateUserSettings,
                recordActivity,
                requestPasswordReset,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}