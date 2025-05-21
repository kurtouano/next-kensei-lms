import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Add this function to the utils.js file
export function formatDate(date) {
  if (!date) return ""

  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString("en-US", options)
}
