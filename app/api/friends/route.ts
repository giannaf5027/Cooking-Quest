// friends list + pending requests

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

        const requests = await prisma.friendRequest.findMany({
            where: { OR: [{ requesterId: id }, { receiverId: id }] },
        })

        const friendIds = requests
            .filter((r) => r.status === "accepted")
            .map((r) => (r.requesterId === id ? r.receiverId : r.requesterId))

        const incoming = requests.filter((r) => r.status === "pending" && r.receiverId === id)
        const outgoingIds = requests.filter((r) => r.status === "pending" && r.requesterId === id).map((r) => r.receiverId)

        // look up names/levels for everyone involved
        const otherIds = [...friendIds, ...incoming.map((r) => r.requesterId)]
        const users = await prisma.user.findMany({
            where: { id: { in: otherIds } },
            select: { id: true, name: true, level: true },
        })
        const userById = (userId: string) => users.find((u) => u.id === userId)

        return NextResponse.json({
            friends: friendIds.map((fid) => userById(fid)).filter(Boolean),
            incoming: incoming.map((r) => ({ requestId: r.id, ...userById(r.requesterId) })),
            outgoingIds,
        })
    }
    catch (error) {
        console.error("Loading friends failed:", error)
        return NextResponse.json({ error: "Could not load friends" }, { status: 500 })
    }
}
