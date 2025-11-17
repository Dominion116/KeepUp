import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount: string | number, decimals: number = 4): string {
  if (typeof amount === 'string') {
    const num = parseFloat(amount);
    return num.toFixed(decimals);
  }
  return amount.toFixed(decimals);
}