/**
 * Calculates Words Per Minute (WPM) based on typed text and time elapsed
 * 
 * @param typed The text that has been typed
 * @param timeInSeconds Time elapsed in seconds
 * @returns The calculated WPM
 */
export function calculateWPM(typed: string, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  
  // Standard WPM calculation assumes 5 characters = 1 word
  const characterCount = typed.length;
  const wordCount = characterCount / 5;
  const minutes = timeInSeconds / 60;
  
  return Math.round(wordCount / minutes);
}

/**
 * Calculates typing accuracy by comparing typed text with expected text
 * 
 * @param typed The text that has been typed
 * @param expected The expected text that should have been typed
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(typed: string, expected: string): number {
  if (typed.length === 0) return 100;
  
  let correctChars = 0;
  let errors = 0;
  const typedLength = Math.min(typed.length, expected.length);
  
  // Compare each character and count errors
  for (let i = 0; i < typedLength; i++) {
    if (typed[i] === expected[i]) {
      correctChars++;
    } else {
      errors++;
    }
  }
  
  // If typed is longer than expected, count extra chars as errors
  if (typed.length > expected.length) {
    errors += typed.length - expected.length;
  }
  
  // Calculate accuracy based on errors vs total characters typed
  return Math.max(0, Math.round(((typedLength - errors) / typedLength) * 100));
}

/**
 * Calculates typing progress as a percentage of the total prompt
 * 
 * @param typed The text that has been typed
 * @param promptLength The total length of the typing prompt
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(typed: string, promptLength: number): number {
  if (promptLength === 0) return 100;
  return Math.min(100, Math.round((typed.length / promptLength) * 100));
}

/**
 * Validates a typing prompt for minimum and maximum length
 * 
 * @param prompt The prompt to validate
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns Whether the prompt is valid
 */
export function validatePrompt(
  prompt: string,
  minLength: number = 50,
  maxLength: number = 250
): boolean {
  const trimmedPrompt = prompt.trim();
  return trimmedPrompt.length >= minLength && trimmedPrompt.length <= maxLength;
}

/**
 * Moderates a prompt for inappropriate content
 * 
 * @param prompt The prompt to moderate
 * @returns An object indicating if the prompt is appropriate and any issues
 */
export function moderatePrompt(prompt: string): { 
  isAppropriate: boolean; 
  issues: string[] 
} {
  const issues: string[] = [];
  let isAppropriate = true;
  
  // Extremely basic moderation - in a real app this would be more sophisticated
  const inappropriateTerms = [
    "profanity1", "profanity2", "slur1", "slur2"
  ];
  
  // Check for inappropriate terms
  for (const term of inappropriateTerms) {
    if (prompt.toLowerCase().includes(term)) {
      isAppropriate = false;
      issues.push(`Contains inappropriate term: ${term}`);
    }
  }
  
  return { isAppropriate, issues };
}
