/**
 * Centralized WPM calculation utilities
 * Used by both single-player and multiplayer modes to ensure consistent calculation
 */

/**
 * Calculate Words Per Minute based on character count and time
 * Standard WPM formula: (characters / 5) / (seconds / 60)
 * 
 * @param characterCount Number of characters typed
 * @param timeInSeconds Time elapsed in seconds
 * @returns Calculated WPM rounded to nearest integer
 */
export function calculateWPM(characterCount: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  
  // Standard WPM calculation assumes 5 characters = 1 word
  const wordCount = characterCount / 5;
  const minutes = timeInSeconds / 60;
  
  return Math.round(wordCount / minutes);
}

/**
 * Calculate WPM from text input
 * Convenience function that counts characters from text
 * 
 * @param typedText The text typed by the user
 * @param timeInSeconds Time elapsed in seconds
 * @returns Calculated WPM rounded to nearest integer
 */
export function calculateWPMFromText(typedText: string, timeInSeconds: number): number {
  return calculateWPM(typedText.length, timeInSeconds);
}

/**
 * Calculate accuracy based on errors and total keypresses
 * 
 * @param errorCount Number of typing errors
 * @param totalKeypresses Total number of keys pressed
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(errorCount: number, totalKeypresses: number): number {
  if (totalKeypresses === 0) return 100;
  
  const accuracyPct = ((totalKeypresses - errorCount) / totalKeypresses) * 100;
  return Math.max(0, Math.min(100, Math.round(accuracyPct)));
}

/**
 * Calculate progress percentage based on typed text and prompt length
 * 
 * @param typedLength Length of text typed so far
 * @param promptLength Total length of the typing prompt
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(typedLength: number, promptLength: number): number {
  if (promptLength === 0) return 100;
  return Math.min(100, Math.round((typedLength / promptLength) * 100));
}