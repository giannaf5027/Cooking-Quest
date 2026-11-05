//
// Created by Karson on 10/20/2026.
//

import { NextResponse } from "next/server"
import { deleteCard } from "@/lib/session"

// logout route - throws away the login card so the next person on this computer isnt logged in as u
export async function POST() {
    await deleteCard()
    return NextResponse.json({ message: "Logged out" })
}
