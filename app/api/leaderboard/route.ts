// top chef leaderboard (KAN-8) - ranked by total xp, simple on purpose

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { checkCard } from "@/lib/session"

const prisma = new PrismaClient()

export async function GET() {
    try {
        const id = await checkCard()
        if (id == null) {
            return NextResponse.json({ error: "Please Login and try again" }, { status: 401 })
        }
        const users = await prisma.user.findMany({
            orderBy: { xp: "desc" },
            take: 20,
            select: { id: true, name: true, xp: true },
        })
        return NextResponse.json(users)
    }
    catch (error) {
        console.error("Loading leaderboard failed:", error)
        return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 })
    }
}
