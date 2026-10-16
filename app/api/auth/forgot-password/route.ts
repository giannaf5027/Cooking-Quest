//
// Created by Ethan on 10/15/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

// forgot password route
export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        // check fields
        if (!email) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // look the user up
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // token expires in 15 minutes
        const token = crypto.randomBytes(32).toString("hex")
        const expiry = new Date(Date.now() + 15 * 60 * 1000)

        await prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry },
        })

        // no email set up yet so the link just gets logged
        console.log(`Reset link: /reset-password?token=${token}&email=${email}`)

        return NextResponse.json({ message: "Reset link sent" })
    }
    catch (error) {
        console.error("Forgot password failed:", error)
        return NextResponse.json({ error: "Forgot password failed" }, { status: 500 })
    }
}
