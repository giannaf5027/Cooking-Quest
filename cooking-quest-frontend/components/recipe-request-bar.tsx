"use client"

//
// Created by Purab on 10/13/2026.
//
// Recipe implementation request bar: lets a user ask for a recipe to be added.
// Drop it anywhere (dashboard, recipes page). Posts to /api/recipe-requests and
// shows the most recent requests so people can see what is already asked for.
//

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Loader2, Send, ChevronDown, ChevronUp } from "lucide-react"

type RecipeRequest = {
    id: string
    title: string
    note: string | null
    requestedBy: string | null
    status: string
    createdAt: string
}

const STATUS_STYLE: Record<string, string> = {
    open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    planned: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
    added: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    declined: "bg-muted text-muted-foreground",
}

export function RecipeRequestBar({ compact = false }: { compact?: boolean }) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [title, setTitle] = useState("")
    const [note, setNote] = useState("")
    const [showNote, setShowNote] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [requests, setRequests] = useState<RecipeRequest[]>([])
    const [showList, setShowList] = useState(!compact)

    // load recent requests
    const load = async () => {
        try {
            const res = await fetch("/api/recipe-requests")
            if (res.ok) setRequests(await res.json())
        } catch {
            // list is optional; the bar still works without it
        }
    }

    useEffect(() => {
        load()
    }, [])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim().length < 3) {
            toast({ title: "Give the recipe a name", description: "At least 3 characters.", variant: "destructive" })
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch("/api/recipe-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, note, requestedBy: user?.name ?? user?.email ?? null }),
            })
            const data = await res.json()
            if (res.status === 409) {
                toast({ title: "Already requested", description: `"${data.request.title}" is already on the list.` })
                setTitle("")
                setNote("")
                return
            }
            if (!res.ok) throw new Error(data.error || "Request failed")
            toast({ title: "Request sent!", description: `We'll look at adding "${data.title}".` })
            setTitle("")
            setNote("")
            setShowNote(false)
            setRequests((prev) => [data, ...prev].slice(0, 20))
            setShowList(true)
        } catch (error) {
            toast({
                title: "Could not send request",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Request a recipe
                </CardTitle>
                <CardDescription>Can&apos;t find something you want to cook? Ask us to add it.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Recipe name"
                            maxLength={80}
                            aria-label="Recipe name"
                            disabled={submitting}
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNote((v) => !v)}
                                aria-expanded={showNote}
                            >
                                {showNote ? "Hide note" : "Add note"}
                            </Button>
                            <Button type="submit" disabled={submitting} className="bg-rose-500 hover:bg-rose-600">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="ml-2">Request</span>
                            </Button>
                        </div>
                    </div>
                    {showNote && (
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Anything we should know? (dietary needs, a link, why you want it)"
                            maxLength={500}
                            aria-label="Note"
                            disabled={submitting}
                        />
                    )}
                </form>

                {requests.length > 0 && (
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => setShowList((v) => !v)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            {showList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {requests.length} recent request{requests.length === 1 ? "" : "s"}
                        </button>
                        {showList && (
                            <ul className="mt-2 divide-y rounded-md border">
                                {requests.slice(0, compact ? 3 : 6).map((r) => (
                                    <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{r.title}</p>
                                            {r.note && <p className="text-xs text-muted-foreground truncate">{r.note}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {r.requestedBy && (
                                                <span className="hidden sm:inline text-xs text-muted-foreground">by {r.requestedBy}</span>
                                            )}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status] ?? STATUS_STYLE.open}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
