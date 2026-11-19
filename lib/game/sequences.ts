// cooking sequences from the cookware1 sheet. each one lists the frames a dish goes
// through from raw to burnt, and `perfect` is the one that counts as done.
// frame numbers were found by rendering the sheet with numbers on it
export type CookSequence = {
  id: string
  name: string
  /** frame numbers in <theme>/cookware1, raw to burnt */
  frames: number[]
  /** which spot in `frames` is perfectly cooked */
  perfect: number
}

export const COOK_SEQUENCES: CookSequence[] = [
  { id: "toast", name: "Toast", frames: [28, 30, 31, 32, 33, 34], perfect: 2 },
  { id: "fries", name: "Air-fryer fries", frames: [17, 18, 19, 20, 21], perfect: 2 },
  { id: "rolls", name: "Oven rolls", frames: [10, 11, 12, 13], perfect: 2 },
  { id: "cookies", name: "Cookies", frames: [63, 64, 65, 66], perfect: 2 },
  { id: "stew", name: "Stew", frames: [22, 24, 25, 26], perfect: 2 },
]
