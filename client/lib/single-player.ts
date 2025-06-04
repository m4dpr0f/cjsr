// TRUST NO ONE themed prompts for React Jam - Perfect for creating paranoia and suspense!
export const prompts = [
  "A shadow Garu mimics you. Will you trust the rhythm—or rewrite the script?",
  "Only one track is real. Will you trust the rhythm—or rewrite the script?",
  "Keystrokes control another. Will you trust the rhythm—or rewrite the script?",
  "One racer is a ghost. Will you trust the rhythm—or rewrite the script?",
  "Your opponent's screen lies. Will you trust the rhythm—or rewrite the script?",
  "Each gets false advice. Will you trust the rhythm—or rewrite the script?",
  "Imposter feeds false prompts. Will you trust the rhythm—or rewrite the script?",
  "The Codex speaks false words. Will you trust the rhythm—or rewrite the script?",
  "Players switch roles mid-race. Will you trust the rhythm—or rewrite the script?",
  "Whispers mid-race mislead. Will you trust the rhythm—or rewrite the script?"
];

// Get a random prompt
export function getRandomPrompt(): string {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Import centralized WPM utilities
import { calculateWPMFromText } from './wpm';

// Calculate WPM - redirects to the centralized implementation
export function calculateWPM(typedText: string, timeInSeconds: number): number {
  return calculateWPMFromText(typedText, timeInSeconds);
}

// Calculate accuracy
export function calculateAccuracy(typed: string, expected: string): number {
  if (typed.length === 0) return 100;
  
  // Initialize tracking variables
  let correctChars = 0;
  let totalChars = typed.length;
  let errors = 0;
  
  // Compare each character
  for (let i = 0; i < typed.length; i++) {
    if (i < expected.length) {
      // Handle special case for hyphens and dashes (consider them equivalent)
      const isHyphen = typed[i] === '-' && ['—', '–', '−', '-'].includes(expected[i]);
      const isMatch = typed[i] === expected[i] || isHyphen;
      
      if (isMatch) {
        correctChars++;
      } else {
        errors++;
        console.log(`Error at position ${i}: typed "${typed[i]}" but expected "${expected[i]}"`);
      }
    } else {
      // Character typed beyond expected length counts as an error
      errors++;
    }
  }
  
  // Calculate accuracy percentage based on errors
  const accuracyPct = ((totalChars - errors) / totalChars) * 100;
  
  // Ensure accuracy is between 0-100 and rounded to nearest integer
  return Math.max(0, Math.min(100, Math.round(accuracyPct)));
}

// Calculate progress
export function calculateProgress(typed: string, promptLength: number): number {
  if (promptLength === 0) return 100;
  return Math.min(100, Math.round((typed.length / promptLength) * 100));
}

// Ghost racer logic
export function calculateGhostProgress(elapsedTimeSeconds: number, ghostWPM: number = 50): number {
  // Calculate how many characters the ghost has typed
  // ghostWPM words per minute = (ghostWPM * 5) characters per minute
  const ghostCharactersTyped = (ghostWPM / 60) * 5 * elapsedTimeSeconds;
  
  // Return progress as a percentage (0-100)
  // This assumes an average prompt length of around 80 characters
  return Math.min(100, Math.round((ghostCharactersTyped / 80) * 100));
}

// Local storage functions for stats
export function saveStats(stats: { 
  wpm: number; 
  accuracy: number; 
  racesCompleted: number;
  promptsContributed?: number;
}): void {
  const currentStats = getStats();
  
  // Update stats
  const newStats = {
    racesCompleted: currentStats.racesCompleted + 1,
    avgWPM: Math.round((currentStats.avgWPM * currentStats.racesCompleted + stats.wpm) / (currentStats.racesCompleted + 1)),
    bestAccuracy: Math.max(currentStats.bestAccuracy, stats.accuracy),
    promptsContributed: currentStats.promptsContributed + (stats.promptsContributed || 0)
  };
  
  // Save to localStorage
  localStorage.setItem('chickenJockeyStats', JSON.stringify(newStats));
}

export function getStats(): { 
  racesCompleted: number; 
  avgWPM: number; 
  bestAccuracy: number;
  promptsContributed: number;
} {
  const statsString = localStorage.getItem('chickenJockeyStats');
  
  if (!statsString) {
    return {
      racesCompleted: 0,
      avgWPM: 0,
      bestAccuracy: 0,
      promptsContributed: 0
    };
  }
  
  return JSON.parse(statsString);
}

// Update user progress
export function saveUserProgress(level: number, xp: number): void {
  localStorage.setItem('chickenJockeyProgress', JSON.stringify({ level, xp }));
}

export function getUserProgress(): { level: number; xp: number } {
  const progressString = localStorage.getItem('chickenJockeyProgress');
  
  if (!progressString) {
    return { level: 1, xp: 0 };
  }
  
  return JSON.parse(progressString);
}

// Calculate XP gained from a race
export function calculateXpGained(wpm: number, accuracy: number): number {
  // Base XP
  let xp = 10;
  
  // Add XP based on WPM (higher WPM = more XP)
  if (wpm > 40) xp += 10;
  if (wpm > 60) xp += 10;
  if (wpm > 80) xp += 10;
  
  // Add XP based on accuracy
  if (accuracy > 90) xp += 5;
  if (accuracy > 95) xp += 5;
  if (accuracy === 100) xp += 5;
  
  return xp;
}