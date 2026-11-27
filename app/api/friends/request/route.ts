//
// Created by Karson on 11/15/2026.
//

// send a friend request

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
        const { receiverId } = await req.json()
        if (typeof receiverId !== "string" || receiverId === id) {
            return NextResponse.json({ error: "Invalid receiver" }, { status: 400 })
        }

        // already a request (either direction) between these two people
        const existing = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { requesterId: id, receiverId },
                    { requesterId: receiverId, receiverId: id },
                ],
            },
        })
        if (existing) {
            return NextResponse.json({ error: "Request already exists" }, { status: 409 })
        }

        const created = await prisma.friendRequest.create({
            data: { requesterId: id, receiverId, status: "pending" },
        })
        return NextResponse.json(created, { status: 201 })
    }
    catch (error) {
        console.error("Sending friend request failed:", error)
        return NextResponse.json({ error: "Could not send request" }, { status: 500 })
    }
}
