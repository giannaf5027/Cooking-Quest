//edit by karson 10/26/2026

// turns a date into "year-mm-dd" using ET
export function getDay(date: Date) {
    return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" })
}

// gives the day before in "year-mm-dd"
function getYesterday(today: string) {
    const d = new Date(today + "T12:00:00Z")
    d.setUTCDate(d.getUTCDate() - 1)
    return d.toISOString().slice(0, 10)
}

export function getNewStreak(lastLoginDay: string | null, oldStreak: number, today: string) {
    if (lastLoginDay === today) {
        // already got credit today
        return { loginStreak: oldStreak, lastLoginDay: today, gotCredit: false }
    } else if (lastLoginDay === getYesterday(today)) {
        //  came back the next day
        return {loginStreak: oldStreak+1, lastLoginDay: today, gotCredit: true }
    } else {
        // rule 3: new user or missed a day
        return { loginStreak: 1, lastLoginDay: today, gotCredit: true}
    }
}