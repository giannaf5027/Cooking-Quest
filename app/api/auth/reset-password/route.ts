//
// Moved out of lib/auth-context.tsx by Purab on 10/13/2026 (Prisma cannot run in a client component).
// Logic is Ethan's: validate the token, hash and store the new password.
//

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { email, token, newPassword } = await req.json()
        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.resetToken || !user.resetTokenExpiry || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
        })
        return NextResponse.json({ ok: true })
    }
    catch (error) {
        console.error("Password reset failed:", error)
        return NextResponse.json({ error: "Could not reset password" }, { status: 500 })
    }
}
