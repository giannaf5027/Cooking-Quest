//
// Created by Purab on 10/13/2026.
//
// Recipe implementation requests: users ask for a recipe to be added.
// Stored in Postgres through Prisma (RecipeRequest model). If the database is
// not reachable (no DATABASE_URL in a local checkout), requests are kept in
// memory for the life of the dev server so the UI still works.
//

import { NextResponse } from "next/server"
import type { PrismaClient } from "@prisma/client"

type RecipeRequest = {
    id: string
    title: string
    note: string | null
    requestedBy: string | null
    status: string
    createdAt: string
}

// in-memory fallback, shared across requests while the server runs
const memory: RecipeRequest[] = []
let prisma: PrismaClient | null = null
let dbAvailable: boolean | null = null

// create the client lazily so a missing generated client or DATABASE_URL
// degrades to the in-memory store instead of crashing the route
async function useDb(): Promise<boolean> {
    if (dbAvailable !== null) return dbAvailable
    try {
        const { PrismaClient } = await import("@prisma/client")
        prisma = new PrismaClient()
        await prisma.$queryRaw`SELECT 1`
        dbAvailable = true
    } catch {
        console.warn("recipe-requests: database unavailable, using in-memory store")
        prisma = null
        dbAvailable = false
    }
    return dbAvailable
}

// GET /api/recipe-requests — newest first, max 20
export async function GET() {
    try {
        if (await useDb() && prisma) {
            const rows = await prisma.recipeRequest.findMany({
                orderBy: { createdAt: "desc" },
                take: 20,
            })
            return NextResponse.json(rows)
        }
        return NextResponse.json(memory.slice(0, 20))
    }
    catch (error) {
        console.error("Listing recipe requests failed:", error)
        return NextResponse.json({ error: "Could not load requests" }, { status: 500 })
    }
}

// POST /api/recipe-requests — body: { title, note?, requestedBy? }
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const title = typeof body.title === "string" ? body.title.trim() : ""
        const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 500) : null
        const requestedBy = typeof body.requestedBy === "string" && body.requestedBy.trim() ? body.requestedBy.trim() : null

        // validate
        if (title.length < 3) {
            return NextResponse.json({ error: "Recipe name must be at least 3 characters" }, { status: 400 })
        }
        if (title.length > 80) {
            return NextResponse.json({ error: "Recipe name must be 80 characters or fewer" }, { status: 400 })
        }

        if (await useDb() && prisma) {
            // avoid duplicate open requests for the same recipe
            const existing = await prisma.recipeRequest.findFirst({
                where: { title: { equals: title, mode: "insensitive" }, status: "open" },
            })
            if (existing) {
                return NextResponse.json({ error: "That recipe has already been requested", request: existing }, { status: 409 })
            }
            const created = await prisma.recipeRequest.create({
                data: { title, note, requestedBy },
            })
            return NextResponse.json(created, { status: 201 })
        }

        const dup = memory.find((r) => r.title.toLowerCase() === title.toLowerCase() && r.status === "open")
        if (dup) {
            return NextResponse.json({ error: "That recipe has already been requested", request: dup }, { status: 409 })
        }
        const created: RecipeRequest = {
            id: `req_${Date.now()}`,
            title,
            note,
            requestedBy,
            status: "open",
            createdAt: new Date().toISOString(),
        }
        memory.unshift(created)
        return NextResponse.json(created, { status: 201 })
    }
    catch (error) {
        console.error("Creating recipe request failed:", error)
        return NextResponse.json({ error: "Could not submit request" }, { status: 500 })
    }
}
