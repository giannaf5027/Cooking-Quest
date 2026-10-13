import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const recordActivity = (activity: {
  type: string
  recipeId?: string
  recipeTitle?: string
  xp: number
}) => {
  // This is a mock function. In a real application, this function would
  // likely make an API call to persist the activity to a database.
  console.log("Activity recorded:", activity)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
