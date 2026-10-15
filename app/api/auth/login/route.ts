//
// Created by Ethan on 10/09/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// login route
export async function POST(req: Request) {
    try {
        const { usernameOrEmail, password } = await req.json()

        // check fields
        if (!usernameOrEmail || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // look the user up by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: usernameOrEmail }, { name: usernameOrEmail }],
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // check the password
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

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
        console.error("Login failed:", error)
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}
