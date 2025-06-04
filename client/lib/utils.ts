import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateWPM(
  typed: string,
  totalSeconds: number
): number {
  if (totalSeconds === 0) return 0;
  
  // Standard WPM calculation - 5 characters = 1 word
  const words = typed.length / 5;
  const minutes = totalSeconds / 60;
  
  return Math.round(words / minutes);
}

export function calculateAccuracy(
  typed: string,
  expected: string
): number {
  if (typed.length === 0) return 100;
  
  let correctChars = 0;
  
  for (let i = 0; i < typed.length; i++) {
    if (i < expected.length && typed[i] === expected[i]) {
      correctChars++;
    }
  }
  
  return Math.round((correctChars / typed.length) * 100);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getXpForLevel(level: number): number {
  // Simple XP curve: Each level requires 100 * level XP
  return level * 100;
}

export function getLevelFromXp(xp: number): { level: number, progress: number } {
  // Find the highest complete level
  let level = 1;
  while (xp >= getXpForLevel(level)) {
    xp -= getXpForLevel(level);
    level++;
  }
  
  // Calculate progress to next level
  const nextLevelXp = getXpForLevel(level);
  const progress = (xp / nextLevelXp) * 100;
  
  return { level, progress };
}

export function generateAvatar(id: string, username: string): string {
  // Generate a deterministic color based on username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 70 + (hash % 30);
  const lightness = 45 + (hash % 10);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
