import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { checkCard } from "@/lib/session"

const prisma = new PrismaClient()
// save the user's meal plan
export async function PUT(req: Request) {
    try {
        const id = await checkCard()
        if (id == null) {
            return NextResponse.json({ error: "Please Login and try again" }, { status: 401 })
        }
        const { mealPlans } = await req.json()
        if (!Array.isArray(mealPlans)) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        const updated = await prisma.user.update({
            where: { id },
            data: { mealPlans },
        })
        return NextResponse.json({ mealPlans: updated.mealPlans })
    }
    catch (error) {
        console.error("Saving meal plan failed:", error)
        return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 })
    }
}
