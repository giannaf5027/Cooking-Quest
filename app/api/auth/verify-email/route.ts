//
// Created by Ethan on 11/12/2026.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// verify email route
export async function POST(req: Request) {
    try {
        const { token } = await req.json()

        // check fields
        if (!token) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // look the user up by the token
        const user = await prisma.user.findFirst({ where: { verificationToken: token } })

        if (!user || !user.verificationTokenExpiry) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // check the token
        if (user.verificationTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // mark the email verified and clear the token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        })

        return NextResponse.json({ message: "Email verified" })
    }
    catch (error) {
        console.error("Verify email failed:", error)
        return NextResponse.json({ error: "Verify email failed" }, { status: 500 })
    }
}
