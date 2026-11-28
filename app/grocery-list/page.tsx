"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format, startOfWeek, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ShoppingBasket, Download, Copy, Check, RotateCcw, CalendarPlus } from "lucide-react"
import { useAuth, planDayKey } from "@/lib/auth-context"
import { buildGroceryLines, categorize } from "@/lib/grocery-list"

// One line on the grocery list.
type ListLine = {
  key: string
  label: string
  category: string
  checked: boolean
}

function buildWeekRange(): { startDate: Date; endDate: Date; label: string } {
  const startDate = startOfWeek(new Date())
  const endDate = addDays(startDate, 6)
  return {
    startDate,
    endDate,
    label: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`,
  }
}

function storageKey(weekStart: Date, userId: string): string {
  return `grocery-checks-${userId}-${format(weekStart, "yyyy-MM-dd")}`
}

export default function GroceryListPage() {
  const { user } = useAuth()
  const { startDate, label } = useMemo(buildWeekRange, [])

  // Planned meals from the calendar, in order.
  const plannedMeals = useMemo(() => {
    if (!user) return []
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
    const meals: { day: Date; id: string; title: string }[] = []
    for (const day of days) {
      const plan = user.mealPlans?.find((p) => planDayKey(p.date) === format(day, "yyyy-MM-dd"))
      if (!plan) continue
      for (const meal of plan.meals) {
        meals.push({ day, id: meal.id, title: meal.title })
      }
    }
    return meals
  }, [user, startDate])

  const lines = useMemo(
    () =>
      buildGroceryLines(plannedMeals.map((m) => m.id)).map(({ key, label }) => ({
        key,
        label,
        category: categorize(`${label} ${key}`),
      })),
    [plannedMeals],
  )

  // Checked items don't reset when the user reloads the page.
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const weekKey = storageKey(startDate, user?.id ?? "logged-out")

  const loadChecked = () => {
    try {
      const raw = localStorage.getItem(weekKey)
      if (raw) setChecked(JSON.parse(raw))
    } catch {
    }
  }

  useEffect(() => {
    loadChecked()
  }, [weekKey])

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(weekKey, JSON.stringify(next))
      } catch {
      }
      return next
    })
  }

  const reset = () => {
    setChecked({})
    try {
      localStorage.removeItem(weekKey)
    } catch {
    }
  }

  const grouped = useMemo(() => {
    const order = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Frozen", "Other"]
    const buckets: Record<string, ListLine[]> = {}
    for (const line of lines) {
      const checkedFlag = !!checked[line.key]
      if (!buckets[line.category]) buckets[line.category] = []
      buckets[line.category].push({ ...line, checked: checkedFlag })
    }
    return order.filter((c) => buckets[c]?.length).map((c) => ({ category: c, items: buckets[c] }))
  }, [lines, checked])

  const toText = () =>
    [
      `Weekly Grocery List - ${label}`,
      "CookMama",
      "",
      ...grouped.flatMap(({ category, items }) => [
        category,
        ...items.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.label}`),
        "",
      ]),
    ].join("\n")

  const download = () => {
    const blob = new Blob([toText()], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grocery-list-${format(startDate, "yyyy-MM-dd")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
    }
  }

  const doneCount = lines.filter((line) => checked[line.key]).length

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ShoppingBasket className="h-8 w-8 text-rose-500" />
            <h1 className="text-3xl font-bold">Grocery List</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Everything needed for the meals planned for {label}.
          </p>
        </div>
        {plannedMeals.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={download}>
              <Download className="mr-2 h-4 w-4" />
              Save .txt
            </Button>
          </div>
        )}
      </div>

      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle>Log in to see your list</CardTitle>
            <CardDescription>Your grocery list is built from the meals you save in the Meal Planner.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : plannedMeals.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nothing planned for {label}</CardTitle>
            <CardDescription>
              Add recipes to the Meal Planner in your dashboard and they will show up here as a
              combined shopping list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Open Meal Planner
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {plannedMeals.length} meal{plannedMeals.length === 1 ? "" : "s"} planned
            </Badge>
            <Badge variant="secondary">
              {doneCount}/{lines.length} gathered
            </Badge>
          </div>

          {grouped.map(({ category, items }) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.key}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md p-1.5 hover:bg-muted/50">
                        <Checkbox checked={item.checked} onCheckedChange={() => toggle(item.key)} />
                        <span className={item.checked ? "text-muted-foreground line-through" : ""}>
                          {item.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
