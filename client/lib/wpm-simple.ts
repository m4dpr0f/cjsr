/**
 * Simple WPM calculation utility that follows the standard formula:
 * WPM = (Total Characters Typed / 5) ÷ Minutes
 */

/**
 * Calculate Words Per Minute based on character count and elapsed time
 * 
 * Standard WPM formula: WPM = (Characters Typed / 5) ÷ Minutes
 * 
 * @param charactersTyped Total number of characters typed
 * @param elapsedTimeMs Elapsed time in milliseconds
 * @returns Calculated WPM rounded to the nearest integer
 */
export function calculateWpm(charactersTyped: number, elapsedTimeMs: number): number {
  // Convert elapsed time to minutes (60,000 ms = 1 minute)
  const minutes = elapsedTimeMs / 60000;
  
  // Avoid division by zero or very small numbers
  if (minutes < 0.01) return 0;
  
  // Calculate words (standard is 5 characters per word)
  const words = charactersTyped / 5;
  
  // Calculate WPM
  const wpm = words / minutes;
  
  // Round to nearest integer and apply reasonable bounds (0-250 WPM)
  return Math.min(250, Math.max(0, Math.round(wpm)));
}

/**
 * Get typing time in milliseconds
 * 
 * @param startTime Starting timestamp (from Date.now())
 * @returns Elapsed time in milliseconds
 */
export function getElapsedTime(startTime: number): number {
  return Date.now() - startTime;
}