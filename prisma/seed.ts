//
// Created by Ethan on 10/08/2026.
//

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    // creates the admin user so the demo can log in
    const hashedAdmin = await bcrypt.hash("cook123", 10)

    await prisma.user.upsert({
        where: { email: "admin@cookmama.com" },
        update: {},
        create: { name: "Admin", email: "admin@cookmama.com", password: hashedAdmin },
    })

    console.log("Seed complete: admin@cookmama.com / cook123")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
