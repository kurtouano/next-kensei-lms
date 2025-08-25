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

export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Never';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMs = now - lastSeenDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // If more than 7 days, just show "7 days ago"
  if (diffInDays > 7) {
    return '7 days ago';
  }
  
  // If more than 1 day
  if (diffInDays > 0) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  
  // If more than 1 hour
  if (diffInHours > 0) {
    return diffInHours === 1 ? '1 hr ago' : `${diffInHours} hrs ago`;
  }
  
  // If more than 1 minute
  if (diffInMinutes > 0) {
    return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`;
  }
  
  // If less than 1 minute
  return 'Just now';
}
