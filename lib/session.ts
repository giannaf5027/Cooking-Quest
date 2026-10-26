//
// Created by Karson on 10/20/2026.
//
// session stuff - makes the login cookie, checks it, deletes it
// based on the "stateless sessions" part of the nextjs auth guide:
// https://nextjs.org/docs/app/guides/authentication
//

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const COOKIE_NAME = "cookmama_session"

// jose wants the secret as bytes not a normal string
function getSecret() {
    const secret = process.env.SESSION_SECRET
    if (!secret) {
        // if this happens u forgot to put SESSION_SECRET in .env
        throw new Error("SESSION_SECRET is missing from .env")
    }
    return new TextEncoder().encode(secret)
}

// makeCard - call this after login works
export async function makeCard(userId: string) {
    // only put the id on the card, xp and lvl stay in the database
    const token = await new SignJWT({ userId: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(getSecret())

    // cookie options 
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true, // so page js cant read it
        secure: process.env.NODE_ENV === "production", // local isnt https so only turn on when live
        sameSite: "lax",
        path: "/",
        maxAge: 60*60*24, // 1 day in seconds
    })
}

// checkCard - returns the user id if the card is good, null if not
export async function checkCard() {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    // no card at all
    if (!token) {
        return null
    }

    try {
        const { payload } = await jwtVerify(token, getSecret(), {
            algorithms: ["HS256"],
        })
        if (typeof payload.userId !== "string") {
            return null
        }
        return payload.userId
    }
    catch (error) {
        // stamp is broken or the card expired
        return null
    }
}

// deleteCard for logout
export async function deleteCard() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}