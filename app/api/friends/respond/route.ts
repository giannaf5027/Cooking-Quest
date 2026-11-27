//
// Created by Karson on 11/15/2026.
//

// accept or decline a friend request

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { checkCard } from "@/lib/session"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const id = await checkCard()
        if (id == null) {
            return NextResponse.json({ error: "Please Login and try again" }, { status: 401 })
        }
        const { requestId, accept } = await req.json()
        if (typeof requestId !== "string" || typeof accept !== "boolean") {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const request = await prisma.friendRequest.findUnique({ where: { id: requestId } })
        // only the receiver can accept or decline
        if (!request || request.receiverId !== id) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        if (accept) {
            const updated = await prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: "accepted" },
            })
            return NextResponse.json(updated)
        }

        // decline - just delete it so they could request again later
        await prisma.friendRequest.delete({ where: { id: requestId } })
        return NextResponse.json({ declined: true })
    }
    catch (error) {
        console.error("Responding to friend request failed:", error)
        return NextResponse.json({ error: "Could not respond to request" }, { status: 500 })
    }
}
