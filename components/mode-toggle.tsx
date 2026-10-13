"use client"

import { Moon, Sun } from "lucide-react"
import { Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider" // Use your custom hook

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "light", label: "Light", bg: "bg-background" },
    { value: "dark", label: "Dark", bg: "bg-black dark:bg-background" },
    { value: "system", label: "System", bg: "bg-gray-100 dark:bg-gray-900" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-background"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background text-foreground">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value as any)}
            className={`flex items-center gap-2 ${theme === opt.value ? opt.bg + " text-primary" : ""}`}
          >
            {theme === opt.value && <Check className="w-4 h-4 mr-2" />}
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
