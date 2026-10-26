//
// Created by Ethan on 10/09/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { makeCard } from "@/lib/session"

const prisma = new PrismaClient()

// signup route
export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        // check fields
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // makes sure the email isnt in use already
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 })
        }

        // hash the password then create the user
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        })

        // new accounts get logged in right away so they need a card too
        await makeCard(user.id)

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            level: user.level,
            isAdmin: user.isAdmin,
            mascot: user.mascot,
        })
    }
    catch (error) {
        console.error("Signup failed:", error)
        return NextResponse.json({ error: "Signup failed" }, { status: 500 })
    }
}
