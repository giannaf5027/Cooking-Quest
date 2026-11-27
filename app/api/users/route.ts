//
// Created by Karson on 11/15/2026.
//

// list of other users to search for friends

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
            where: { id: { not: id } },
            select: { id: true, name: true, level: true, xp: true },
        })
        return NextResponse.json(users)
    }
    catch (error) {
        console.error("Loading users failed:", error)
        return NextResponse.json({ error: "Could not load users" }, { status: 500 })
    }
}
