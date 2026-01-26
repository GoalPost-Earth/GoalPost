import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeString(str: string) {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
