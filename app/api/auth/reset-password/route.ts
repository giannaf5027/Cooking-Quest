//
// Created by Ethan on 10/15/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// reset password route
export async function POST(req: Request) {
    try {
        const { email, token, newPassword } = await req.json()

        // check fields
        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // look the user up
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // check the token
        if (user.resetToken !== token || user.resetTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        })

        return NextResponse.json({ message: "Password reset" })
    }
    catch (error) {
        console.error("Reset password failed:", error)
        return NextResponse.json({ error: "Reset password failed" }, { status: 500 })
    }
}
