import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { checkCard } from "@/lib/session"


const prisma = new PrismaClient()
// save xp and level progress
export async function POST(req: Request) {
    try {
        const id = await checkCard()
        if ( id == null) {
            return NextResponse.json({ error: "Please Login and try again" }, { status: 401 })
        }
        const { xp, level } = await req.json()
        // check fields
        if ( typeof xp !== "number" || typeof level !== "number") {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        
        // look up the user's current saved progress
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        // cant let saved progress go backwards
        if (xp < user.xp || level < user.level) {
            return NextResponse.json({ error: "Progress can't go down" }, { status: 409 })
        }
        // save/update progress
        const updated = await prisma.user.update({
            where: { id },
            data: { xp, level },
        })
        return NextResponse.json({ xp: updated.xp, level: updated.level })
    }
    catch (error) {
        console.error("Saving progress failed:", error)
        return NextResponse.json({ error: "Saving progress failed" }, { status: 500 })
    }
}