import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUserDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Example: "June 1, 2025"
  // Or for "6/1/2025" specifically, if that's the server default:
  //  return new Date(dateString).toLocaleDateString('en-US'); // Assuming 'en-US' gives M/D/YYYY
}
