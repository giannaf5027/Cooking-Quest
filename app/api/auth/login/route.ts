//
// Created by Ethan on 10/09/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { makeCard } from "@/lib/session"
import { getDay, getNewStreak } from "@/lib/streaks"

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

        // password is good, give them a login card
        await makeCard(user.id)

        // login streak only counts once per day
        const today = getDay(new Date())
        const streak = getNewStreak(user.lastLoginDay, user.loginStreak, today)
        // already logged in today 
        if (streak.gotCredit) {
            await prisma.user.update({
                where: { id: user.id },
                data: { loginStreak: streak.loginStreak, lastLoginDay: streak.lastLoginDay },
            })
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            level: user.level,
            isAdmin: user.isAdmin,
            mascot: user.mascot,
            loginStreak: streak.loginStreak, // new number not the old one from user
            gotStreakCredit: streak.gotCredit, // front end shows the banner if true
        })
    }
    catch (error) {
        console.error("Login failed:", error)
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}
