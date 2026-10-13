//
// Moved out of lib/auth-context.tsx by Purab on 10/13/2026 (Prisma cannot run in a client component).
// Logic is Ethan's: issue a reset token that expires in one hour.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { email } = await req.json()
        if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const token = crypto.randomBytes(32).toString("hex")
        const expiry = new Date(Date.now() + 60 * 60 * 1000)
        await prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry },
        })

        // no mailer yet: log the link on the server so the team can test the flow
        console.log(`Reset link: /reset-password?token=${token}&email=${email}`)
        return NextResponse.json({ ok: true })
    }
    catch (error) {
        console.error("Password reset request failed:", error)
        return NextResponse.json({ error: "Could not start password reset" }, { status: 500 })
    }
}
