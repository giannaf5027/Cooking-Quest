"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

type Theme = "dark" | "light" | "system" | "default" | "rose" | "emerald" | "amber" | "sky"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const { user } = useAuth()

  useEffect(() => {
    const root = window.document.documentElement

    // Handle dark/light mode
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else if (theme === "dark" || theme === "light") {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }

    // Handle color theme (separate from dark/light mode)
    root.classList.remove("theme-default", "theme-rose", "theme-emerald", "theme-amber", "theme-sky")

    // Apply user's color theme if logged in
    if (user && user.settings && user.settings.theme) {
      root.classList.add(`theme-${user.settings.theme}`)
    } else {
      // Default theme if not logged in
      root.classList.add("theme-default")
    }
  }, [theme, user])

  // Only update dark/light mode theme from the theme toggle
  // Color themes are controlled by user settings

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Only store dark/light/system in localStorage
      if (theme === "dark" || theme === "light" || theme === "system") {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
