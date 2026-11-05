"use client"

//
// Created by Ethan on 10/07/2026.
//


import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isSameDay } from "date-fns"

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
    loginStreak?: number // days in a row logged in
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
    signIn: (usernameOrEmail: string, password: string) => Promise<{ gotStreakCredit: boolean; loginStreak: number }>
    signUp: (name: string, email: string, password: string) => Promise<void>
    signOut: () => void
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

// auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // check for existing session on mount
    useEffect(() => {
        const checkSession = () => {
            const storedUser = localStorage.getItem("cookmama_user")
            if (storedUser) {
                setUser(JSON.parse(storedUser))
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

    // save xp and level to the database
    const saveProgress = async (id: string, xp: number, level: number) => {
        try {
            const res = await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, xp, level }), //turn data into text before sending
            })
            if (!res.ok) {
                const data = await res.json()
                console.error("Saving progress failed:", data.error)
            }
        }
        catch (error) {
            console.error("Saving progress failed:", error)
        }
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
        // send the new progress to the database
        saveProgress(updatedUser.id, updatedUser.xp, updatedUser.level)
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

    // recipes unlocked at a given level (same rules as addXp)
    const recipesForLevel = (level: number) => {
        const recipes = ["1", "2", "3"]
        if (level >= 2) recipes.push("4", "5")
        if (level >= 3) recipes.push("6")
        return recipes
    }

    // sign in - checks the email/username and password with the backend api
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
                level: data.level,
                xp: data.xp,
                loginStreak: data.loginStreak,
                isAdmin: data.isAdmin,
                favorites: [],
                badges: [],
                friends: [],
                mealPlans: [],
                availableRecipes: recipesForLevel(data.level),
                mascot: data.mascot,
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
            // login page uses this to show the streak banner
            return { gotStreakCredit: data.gotStreakCredit === true, loginStreak: data.loginStreak ?? 0 }
        } finally {
            setIsLoading(false)
        }
    }

    // sign up - creates the account through the backend api
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
                level: data.level,
                xp: data.xp,
                isAdmin: data.isAdmin,
                favorites: [],
                badges: [],
                friends: [],
                mealPlans: [],
                availableRecipes: recipesForLevel(data.level),
                mascot: data.mascot,
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
        // tell the server to throw away the login card
        fetch("/api/auth/logout", { method: "POST" }).catch((error) => {
            console.error("Logout failed:", error)
        })
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